'use strict';

// Delivery options, shipping labels and tracking updates (DPD via Moov).
//
// - DPD shop to home: the seller drops the parcel at any DPD Pickup shop
//   (QR code or printed label) and DPD delivers to the buyer's door. Service
//   code set in Admin → Shipping (DPD-12DROPQR, or DPD12-DROP for label only).
//   More couriers can be added as options.
// - Prices are admin-editable in Admin → Fees (shipping_fee_<size>).
// - Oversized items don't fit DPD's limits, so the seller arranges delivery at
//   the listing's own shipping fee and no label is created through Moov.
// - Moov response / webhook shapes aren't documented to us; the normalisers
//   below accept the common field names and keep that guesswork in one place.

const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { getMoovSettings, moovRequest } = require('../lib/moov');
const { getDispatchWindowDays } = require('./notificationService');

const COURIER = 'DPD';
const LABELLED_SIZES = ['small', 'medium', 'large'];

const PRICE_DEFAULTS = { small: 3.49, medium: 5.49, large: 8.99, oversized: 14.99 };

// DPD drop-off limits per parcel (confirmed by Moov)
const DPD_MAX_SIDE_CM = 60;
const DPD_MAX_WEIGHT_KG = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

// Box sent to the courier per parcel size. Placeholder limits until the client
// confirms the Small / Medium / Large box sizes.
const PARCEL_BOXES = {
  small:  { length: 35, width: 25, height: 10, weightKg: 2 },
  medium: { length: 45, width: 35, height: 20, weightKg: 5 },
  large:  { length: 60, width: 45, height: 40, weightKg: 15 },
};

// Seeded per-product data (variant options) is more accurate than the generic
// box, e.g. "32–36 x 19–22 x 15–18" / "0.7–1.0 kg". Ranges use the upper bound.
const maxNumber = (text) => Math.max(...(String(text).match(/\d+(?:\.\d+)?/g) ?? []).map(Number));

function parseBoxCm(text) {
  const parts = String(text ?? '').replace(/\(.*?\)/g, '').split(/\s*[x×]\s*/i);
  if (parts.length !== 3) return null;
  const [length, width, height] = parts.map(maxNumber);
  return [length, width, height].every((n) => Number.isFinite(n) && n > 0) ? { length, width, height } : null;
}

function parseWeightKg(text) {
  const n = maxNumber(text);
  if (!Number.isFinite(n) || n <= 0) return null;
  return /\d\s*g\b/i.test(text) && !/kg/i.test(text) ? n / 1000 : n;
}

// Largest box / heaviest weight among the listing's options, else the size default
function parcelFor(listing) {
  const fallback = PARCEL_BOXES[listing?.parcelSize];
  if (!fallback) return null;
  const options = (listing.variants ?? []).map((v) => v.variantOption).filter(Boolean);
  const boxes = options.map((o) => parseBoxCm(o.shippingBoxCm)).filter(Boolean);
  const weights = options.map((o) => parseWeightKg(o.estWeight)).filter(Boolean);
  const box = boxes.sort((a, b) => b.length * b.width * b.height - a.length * a.width * a.height)[0] ?? fallback;
  const weightKg = weights.length ? Math.ceil(Math.max(...weights) * 10) / 10 : fallback.weightKg;
  return { length: box.length, width: box.width, height: box.height, weightKg };
}

const METHOD_LABEL = {
  home:   'DPD home delivery',
  seller: 'Tracked delivery arranged by the seller',
};

// ─── Prices & options ────────────────────────────────────────────────────────

async function getDeliveryRates() {
  const rows = await prisma.feeConfig.findMany({
    where: { configKey: { in: Object.keys(PRICE_DEFAULTS).map((s) => `shipping_fee_${s}`) } },
    select: { configKey: true, configValue: true },
  });
  const value = Object.fromEntries(rows.map((r) => [r.configKey, Number(r.configValue)]));
  return {
    home: Object.fromEntries(Object.entries(PRICE_DEFAULTS).map(([s, d]) => [s, value[`shipping_fee_${s}`] ?? d])),
  };
}

// Options a buyer can choose for one item. `fallbackFee` is the listing's own
// shipping fee, used for seller-arranged (oversized) delivery.
function deliveryOptionsFor(parcelSize, rates, fallbackFee) {
  if (!LABELLED_SIZES.includes(parcelSize)) {
    const price = Number(fallbackFee ?? rates.home.oversized);
    return [{ method: 'seller', courier: null, label: METHOD_LABEL.seller, price }];
  }
  return [{ method: 'home', courier: COURIER, label: METHOD_LABEL.home, price: rates.home[parcelSize] }];
}

// Public rates for the frontend ("Tracked delivery from £x")
async function getPublicDeliveryRates() {
  const rates = await getDeliveryRates();
  return { courier: COURIER, labelledSizes: LABELLED_SIZES, rates };
}

// ─── Labels ──────────────────────────────────────────────────────────────────

const labelsInProgress = new Set(); // stops a double click buying two labels

const IMAGE_MIME = [['JVBER', 'application/pdf'], ['/9j/', 'image/jpeg'], ['iVBOR', 'image/png'], ['R0lGOD', 'image/gif'], ['PHN2Zy', 'image/svg+xml']];
const base64Mime = (b64) => IMAGE_MIME.find(([sig]) => b64.startsWith(sig))?.[1] ?? null;

// String values under keys matching `re`, anywhere in the response
function findByKey(obj, re, depth = 0) {
  if (!obj || typeof obj !== 'object' || depth > 4) return [];
  const out = [];
  for (const [k, v] of Object.entries(obj)) {
    const first = Array.isArray(v) ? v[0] : v;
    if (re.test(k) && typeof first === 'string') out.push(first);
    else if (v && typeof v === 'object') out.push(...findByKey(v, re, depth + 1));
  }
  return out;
}

// DPD-12DROPQR also returns a QR code / barcode for drop-off without a
// printer: keep the image (base64) and/or the raw code.
function readDropOff(data) {
  const values = findByKey(data, /qr|barcode/i);
  let image = null;
  let code = null;
  for (const v of values) {
    const b64 = v.replace(/^data:[^;]+;base64,/, '').trim();
    const mime = b64.length > 100 ? base64Mime(b64) : null;
    if (mime && mime !== 'application/pdf' && !image) image = { base64: b64, mime };
    else if (!mime && v.length <= 100 && !/^https?:/i.test(v) && !code) code = v.trim();
  }
  return { image, code };
}

function readLabel(data) {
  const raw = [data?.labels, data?.label, data?.label_data, data?.base64, data?.data?.labels]
    .map((v) => (Array.isArray(v) ? v[0] : v))
    .find((v) => typeof v === 'string' && v.length > 100);
  if (!raw) return null;
  const base64 = raw.replace(/^data:[^;]+;base64,/, '');
  return { base64, mime: base64Mime(base64) ?? 'image/png' };
}

function readTracking(data) {
  const codes = data?.tracking_codes ?? data?.tracking_numbers;
  return {
    trackingNumber: (Array.isArray(codes) ? codes[0] : null) ?? data?.tracking_number ?? data?.tracking_code ?? null,
    trackingUrl:    data?.tracking_url ?? (Array.isArray(data?.tracking_urls) ? data.tracking_urls[0] : null) ?? null,
    labelKey:       data?.key ?? data?.label_key ?? null,
  };
}

const SELLER_ADDRESS_SELECT = {
  fullName: true, displayName: true, email: true, phone: true,
  addressLine1: true, addressLine2: true, addressCity: true, addressPostcode: true,
};

function requireSellerAddress(seller) {
  const missing = !seller.addressLine1 || !seller.addressCity || !seller.addressPostcode || !seller.phone;
  if (missing) {
    throw new AppError(
      'Add your address and phone number in Settings → Address & contact before creating a label — it’s printed on the label as the sender',
      400, 'SELLER_ADDRESS_REQUIRED'
    );
  }
}

async function createLabel(orderId, sellerId) {
  if (labelsInProgress.has(orderId)) {
    throw new AppError('A label is already being created for this order', 409, 'LABEL_IN_PROGRESS');
  }
  labelsInProgress.add(orderId);
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        seller: { select: SELLER_ADDRESS_SELECT },
        buyer:  { select: { email: true, displayName: true } },
        listing: {
          select: {
            parcelSize: true,
            variants: { select: { variantOption: { select: { shippingBoxCm: true, estWeight: true } } } },
          },
        },
      },
    });
    if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
    if (order.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
    if (order.fulfilmentStatus !== 'awaiting_dispatch') {
      throw new AppError('Labels can only be created before the order is dispatched', 409, 'INVALID_STATUS');
    }
    if (order.labelCreatedAt) throw new AppError('A label already exists for this order', 409, 'LABEL_EXISTS');

    const box = parcelFor(order.listing);
    if (order.deliveryMethod === 'seller' || !box) {
      throw new AppError('This item is too large for DPD — please arrange tracked delivery yourself', 400, 'LABEL_NOT_AVAILABLE');
    }
    if (Math.max(box.length, box.width, box.height) > DPD_MAX_SIDE_CM || box.weightKg > DPD_MAX_WEIGHT_KG) {
      throw new AppError(
        `This parcel is over DPD's limit (${DPD_MAX_SIDE_CM} × ${DPD_MAX_SIDE_CM} × ${DPD_MAX_SIDE_CM} cm, ${DPD_MAX_WEIGHT_KG} kg) — please arrange tracked delivery yourself`,
        400, 'LABEL_NOT_AVAILABLE'
      );
    }
    requireSellerAddress(order.seller);

    const settings = await getMoovSettings();
    const serviceId = settings.config.dpd_home_service_id;
    if (!serviceId) {
      throw new AppError('The DPD service code is not set up yet. Contact the administrator.', 503, 'MOOV_NOT_CONFIGURED');
    }

    const seller = order.seller;
    // Shipping date = today; the seller drops off at a DPD shop by the dispatch deadline
    const shipDate = new Date().toISOString().slice(0, 10);
    const dropOffBy = new Date(order.createdAt.getTime() + (await getDispatchWindowDays()) * DAY_MS);
    const reference = `KL${order.id.replace(/-/g, '').slice(0, 16).toUpperCase()}`;
    const data = await moovRequest(settings, 'courier', '/api/couriers/v1/MoovParcel/create-label', {
      testing: settings.environment !== 'live',
      auth_company: settings.config.auth_company,
      format_address_default: true,
      request_id: order.id,
      shipment: {
        label_size: '6x4',
        label_format: 'png', // base64 image, shown inside a Kit Loop-branded print page
        generate_invoice: false,
        generate_packing_slip: false,
        courier: { auth_company: settings.config.courier_auth_company },
        collection_date: `${shipDate} 18:00:00`,
        dc_service_id: serviceId,
        reference,
        reference_2: '',
        delivery_instructions: '',
        ship_from: {
          name: seller.fullName || seller.displayName, phone: seller.phone, email: seller.email,
          company_name: '', address_1: seller.addressLine1, address_2: seller.addressLine2 ?? '', address_3: '',
          city: seller.addressCity, postcode: seller.addressPostcode, county: '', country_iso: 'GB',
        },
        ship_to: {
          name: order.deliveryName || order.buyer.displayName, phone: order.deliveryPhone ?? '', email: order.buyer.email,
          company_name: null, address_1: order.deliveryAddressLine1, address_2: order.deliveryAddressLine2 ?? '', address_3: '',
          city: order.deliveryCity, county: '', postcode: order.deliveryPostcode, country_iso: 'GB', tax_id: null,
        },
        parcels: [{
          dim_width: box.width, dim_height: box.height, dim_length: box.length, dim_unit: 'cm',
          items: [{
            description: order.snapshotListingTitle, origin_country: 'GB', quantity: 1,
            value_currency: 'GBP', weight: box.weightKg, weight_unit: 'KG',
            sku: order.listingId.slice(0, 20), value: Number(order.itemPrice).toFixed(2),
            extended_description: order.snapshotListingTitle,
          }],
        }],
      },
    });

    const label = readLabel(data);
    if (!label) throw new AppError('The courier did not return a label. Please try again.', 502, 'MOOV_ERROR');
    const tracking = readTracking(data);
    const dropOff = readDropOff(data);
    if (settings.environment !== 'live') {
      // Field names only (no values) — to confirm Moov's response shape in test mode
      console.info('[shipping] create-label response keys:', Object.keys(data ?? {}).join(', '), '| QR:', Boolean(dropOff.image), '| code:', Boolean(dropOff.code));
    }

    return prisma.order.update({
      where: { id: order.id },
      data: {
        shippingCourier:   COURIER,
        shippingServiceId: serviceId,
        shippingReference: reference,
        labelKey:          tracking.labelKey,
        labelFormat:       'image',
        labelData:         label.base64,
        labelMime:         label.mime,
        labelCreatedAt:    new Date(),
        dropOffBy,
        dropOffQr:         dropOff.image?.base64 ?? null,
        dropOffQrMime:     dropOff.image?.mime ?? null,
        dropOffCode:       dropOff.code ? dropOff.code.slice(0, 100) : null,
        trackingNumber:    tracking.trackingNumber ?? order.trackingNumber,
        trackingUrl:       tracking.trackingUrl,
      },
      select: { id: true },
    });
  } finally {
    labelsInProgress.delete(orderId);
  }
}

// The label file, or the drop-off QR code (kind 'qr'), seller only
async function getLabel(orderId, sellerId, kind = 'label') {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: { sellerId: true, labelData: true, labelMime: true, dropOffQr: true, dropOffQrMime: true },
  });
  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (kind === 'qr') {
    if (!order.dropOffQr) throw new AppError('No QR code for this order — use the printed label', 404, 'NOT_FOUND');
    return { buffer: Buffer.from(order.dropOffQr, 'base64'), mime: order.dropOffQrMime || 'image/png' };
  }
  if (!order.labelData) throw new AppError('No label has been created for this order', 404, 'NOT_FOUND');
  return { buffer: Buffer.from(order.labelData, 'base64'), mime: order.labelMime || 'image/png' };
}

// Voids an unused label (cancelled order) so it isn't charged. Best effort.
async function cancelLabel(order) {
  if (!order.shippingReference || !order.labelCreatedAt) return;
  try {
    const settings = await getMoovSettings();
    await moovRequest(settings, 'courier', '/api/couriers/v1/MoovParcel/mark-shipment-cancelled', {
      testing: settings.environment !== 'live',
      auth_company: settings.config.auth_company,
      reference: order.shippingReference,
      cancel_label: true,
    });
  } catch (err) {
    console.error(`[shipping] Could not cancel label for order ${order.id}:`, err.message);
  }
}

// ─── Tracking updates ────────────────────────────────────────────────────────
// Turns one Moov / DPD tracking payload into
// { reference, trackingNumber, status, text, at, collectionPoint, collectBy }.
// status: in_transit | out_for_delivery | awaiting_collection | delivered | exception

const COLLECTION_HOLD_DAYS = 7; // DPD keeps uncollected parcels at a shop for about a week

function pick(obj, keys) {
  for (const k of keys) {
    const v = k.split('.').reduce((o, p) => o?.[p], obj);
    if (v != null && v !== '') return v;
  }
  return null;
}

function classifyStatus(text) {
  const t = String(text ?? '').toLowerCase();
  if (!t) return null;
  if (/(collected|picked up) by (the )?(customer|recipient|buyer)/.test(t)) return 'delivered';
  if (/(ready|awaiting|available) (for |to )?collect(ion)?|collect (it )?from|delivered to (a |the |your )?(dpd )?(pickup|parcel ?shop|shop)/.test(t)) return 'awaiting_collection';
  if (/dropped (off|in)|drop[- ]?off|handed (in|over)|accepted at|received (at|by) (a |the )?(dpd )?(pickup|parcel ?shop|shop)/.test(t)) return 'in_transit';
  if (/out for delivery|with (the )?driver|on (its|the) way to you/.test(t)) return 'out_for_delivery';
  if (/undelivered|not delivered|failed|unable|returned|return to sender|damaged|exception|refused/.test(t)) return 'exception';
  if (/delivered|collected by (the )?(customer|recipient)|picked up by (the )?(customer|recipient)/.test(t)) return 'delivered';
  if (/collected|picked up|received|in transit|at (the )?(hub|depot)|despatched|dispatched|on its way|scanned/.test(t)) return 'in_transit';
  return null;
}

function normaliseTrackingUpdate(body) {
  const event = Array.isArray(body?.events) ? body.events[0] : (body?.event ?? body?.data ?? body);
  const codes = pick(body, ['tracking_codes', 'shipment.tracking_codes']);
  const text = pick(event, ['status_description', 'description', 'status_text', 'status', 'event', 'message'])
    ?? pick(body, ['status_description', 'description', 'status', 'tracking_status']);
  const code = pick(event, ['status_code', 'code']) ?? pick(body, ['status_code']);
  const at = pick(event, ['date', 'datetime', 'timestamp', 'event_date', 'created_at']) ?? pick(body, ['date', 'timestamp']);
  const point = pick(event, ['pickup_location', 'location', 'parcel_shop', 'pickup_point']) ?? pick(body, ['pickup_location', 'parcel_shop']);
  const collectBy = pick(event, ['collect_by', 'collection_deadline', 'expiry_date', 'hold_until'])
    ?? pick(body, ['collect_by', 'collection_deadline', 'expiry_date']);

  const pointName = typeof point === 'string' ? point : pick(point, ['name', 'company_name', 'location_name']);
  const pointAddress = point && typeof point === 'object'
    ? [pick(point, ['address_1', 'address1', 'street']), pick(point, ['city', 'town']), pick(point, ['postcode', 'post_code'])].filter(Boolean).join(', ')
    : null;

  const parsedAt = at ? new Date(at) : null;
  const parsedCollectBy = collectBy ? new Date(collectBy) : null;
  return {
    reference:      pick(body, ['reference', 'shipment.reference', 'shipment_reference', 'customer_reference']),
    trackingNumber: (Array.isArray(codes) ? codes[0] : null) ?? pick(body, ['tracking_number', 'tracking_code', 'shipment.tracking_number', 'consignment_number', 'parcel_number']),
    status:         classifyStatus(`${text ?? ''} ${code ?? ''}`),
    text:           text ? String(text).slice(0, 255) : null,
    at:             parsedAt && !Number.isNaN(parsedAt.getTime()) ? parsedAt : new Date(),
    collectionPoint: pointName ? { name: String(pointName).slice(0, 150), address: pointAddress || null } : null,
    collectBy:      parsedCollectBy && !Number.isNaN(parsedCollectBy.getTime()) ? parsedCollectBy : null,
  };
}

module.exports = {
  METHOD_LABEL,
  COLLECTION_HOLD_DAYS,
  parcelFor,
  getDeliveryRates,
  deliveryOptionsFor,
  getPublicDeliveryRates,
  createLabel,
  getLabel,
  cancelLabel,
  normaliseTrackingUpdate,
};
