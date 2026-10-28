const { randomUUID } = require('crypto');
const prisma = require('../lib/prisma');
const stripe = require('../lib/stripe');
const AppError = require('../utils/AppError');
const { notifyOrderPlaced } = require('./notificationService');
const { ensureStripeCustomer } = require('./paymentService');

// ─── Fee defaults (used if fee_config rows are absent) ───────────────────────
const FEE_DEFAULTS = {
  buyer_protection_fee_percentage: 0.05,   // 5 %
  platform_commission_percentage: 0.10,   // 10 %
  dispute_window_days: 3,
};

async function getFeeValue(key) {
  const row = await prisma.feeConfig.findUnique({ where: { configKey: key } });
  return row ? Number(row.configValue) : FEE_DEFAULTS[key];
}

// ─── In-memory checkout session store (15-min TTL) ───────────────────────────
const SESSION_TTL_MS = 15 * 60 * 1000;
const _sessions = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of _sessions) {
    if (s.expiresAt.getTime() < now) _sessions.delete(id);
  }
}, 5 * 60 * 1000).unref();

function _getSession(id) {
  const s = _sessions.get(id);
  if (!s) return null;
  if (s.expiresAt < new Date()) { _sessions.delete(id); return null; }
  return s;
}

// ─── 1. initiateCheckout ──────────────────────────────────────────────────────
async function initiateCheckout(listingId, buyerId, counterOfferId = null) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { id: true, username: true, displayName: true } } },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');
  if (listing.status !== 'live') {
    throw new AppError('This item is no longer available', 409, 'LISTING_NOT_AVAILABLE');
  }
  if (listing.sellerId === buyerId) {
    throw new AppError('You cannot buy your own listing', 400, 'SELF_PURCHASE');
  }

  // Price-lock from counter offer if provided
  let itemPrice = Number(listing.price);
  let resolvedCounterOfferId = null;

  if (counterOfferId) {
    const co = await prisma.counterOffer.findUnique({ where: { id: counterOfferId } });
    if (
      !co ||
      co.listingId !== listingId ||
      co.buyerId !== buyerId ||
      co.status !== 'accepted'
    ) {
      throw new AppError('Counter offer not valid for this checkout', 400, 'INVALID_COUNTER_OFFER');
    }
    if (!co.checkoutPriceLockExpiresAt || co.checkoutPriceLockExpiresAt < new Date()) {
      throw new AppError('Counter offer price lock has expired', 410, 'PRICE_LOCK_EXPIRED');
    }
    itemPrice = Number(co.counterAmount);
    resolvedCounterOfferId = co.id;
  }

  // Fetch fee configuration
  const [buyerProtectionPct, commissionPct] = await Promise.all([
    getFeeValue('buyer_protection_fee_percentage'),
    getFeeValue('platform_commission_percentage'),
  ]);

  const shippingFee        = Number(listing.shippingFee);
  const buyerProtectionFee = Number((itemPrice * buyerProtectionPct).toFixed(2));
  const platformCommission = Number((itemPrice * commissionPct).toFixed(2));
  const totalAmount        = Number((itemPrice + shippingFee + buyerProtectionFee).toFixed(2));
  const sellerNetAmount    = Number((itemPrice - platformCommission).toFixed(2));

  const session = {
    id: randomUUID(),
    listingId,
    buyerId,
    sellerId: listing.sellerId,
    counterOfferId: resolvedCounterOfferId,
    listing: {
      id: listing.id,
      title: listing.title,
      condition: listing.condition,
      photos: listing.photos,
      parcelSize: listing.parcelSize,
      sellerDisplayName: listing.seller.displayName,
    },
    itemPrice,
    shippingFee,
    buyerProtectionFee,
    platformCommission,
    totalAmount,
    sellerNetAmount,
    deliveryAddress: null,
    paymentIntentId: null,
    paymentIntentClientSecret: null,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    createdAt: new Date(),
  };

  _sessions.set(session.id, session);
  return session;
}

// ─── 1b. initiateCartCheckout ─────────────────────────────────────────────────
// One session (and later one PaymentIntent) for every available item in the
// buyer's cart. Each item still becomes its own order with its own fees.
async function initiateCartCheckout(buyerId) {
  const rows = await prisma.cartItem.findMany({
    where: { userId: buyerId },
    orderBy: { createdAt: 'asc' },
    include: {
      listing: {
        include: { seller: { select: { id: true, username: true, displayName: true, accountStatus: true } } },
      },
    },
  });

  const available = rows.filter((r) => r.listing.status === 'live'
    && r.listing.sellerId !== buyerId
    && r.listing.seller?.accountStatus === 'active');
  if (!available.length) {
    throw new AppError('Your cart has no items available to buy', 409, 'CART_EMPTY');
  }

  const [buyerProtectionPct, commissionPct] = await Promise.all([
    getFeeValue('buyer_protection_fee_percentage'),
    getFeeValue('platform_commission_percentage'),
  ]);

  const items = available.map(({ listing }) => {
    const itemPrice          = Number(listing.price);
    const shippingFee        = Number(listing.shippingFee);
    const buyerProtectionFee = Number((itemPrice * buyerProtectionPct).toFixed(2));
    const platformCommission = Number((itemPrice * commissionPct).toFixed(2));
    return {
      listingId: listing.id,
      sellerId: listing.sellerId,
      listing: {
        id: listing.id,
        title: listing.title,
        condition: listing.condition,
        photos: listing.photos,
        parcelSize: listing.parcelSize,
        sellerDisplayName: listing.seller.displayName,
        sellerUsername: listing.seller.username,
      },
      itemPrice,
      shippingFee,
      buyerProtectionFee,
      platformCommission,
      totalAmount: Number((itemPrice + shippingFee + buyerProtectionFee).toFixed(2)),
      sellerNetAmount: Number((itemPrice - platformCommission).toFixed(2)),
    };
  });

  const sum = (key) => Number(items.reduce((t, i) => t + i[key], 0).toFixed(2));

  const session = {
    id: randomUUID(),
    type: 'cart',
    buyerId,
    items,
    skippedCount: rows.length - available.length,
    itemPrice: sum('itemPrice'),
    shippingFee: sum('shippingFee'),
    buyerProtectionFee: sum('buyerProtectionFee'),
    platformCommission: sum('platformCommission'),
    totalAmount: sum('totalAmount'),
    sellerNetAmount: sum('sellerNetAmount'),
    deliveryAddress: null,
    paymentIntentId: null,
    paymentIntentClientSecret: null,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    createdAt: new Date(),
  };

  _sessions.set(session.id, session);
  return session;
}

// ─── 2. getCheckoutSession ────────────────────────────────────────────────────
function getCheckoutSession(sessionId, buyerId) {
  const session = _getSession(sessionId);
  if (!session) throw new AppError('Checkout session not found or expired', 404, 'SESSION_NOT_FOUND');
  if (session.buyerId !== buyerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  return session;
}

// ─── 3. submitAddress ─────────────────────────────────────────────────────────
async function submitAddress(sessionId, buyerId, addressData) {
  const session = getCheckoutSession(sessionId, buyerId);

  session.deliveryAddress = {
    line1:    addressData.line1,
    line2:    addressData.line2 || null,
    city:     addressData.city,
    postcode: addressData.postcode.toUpperCase(),
  };

  return session;
}

// ─── 4. createPaymentIntent ───────────────────────────────────────────────────
async function createPaymentIntent(sessionId, buyerId) {
  const session = getCheckoutSession(sessionId, buyerId);

  if (!session.deliveryAddress) {
    throw new AppError('Submit your delivery address first', 400, 'ADDRESS_REQUIRED');
  }

  // Ensure buyer has a Stripe customer that exists in the current Stripe account
  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
  const stripeCustomerId = await ensureStripeCustomer(buyer);

  // Create or reuse an existing PaymentIntent for this session
  if (session.paymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(session.paymentIntentId);
    if (existing.status === 'requires_payment_method' || existing.status === 'requires_confirmation') {
      return { clientSecret: session.paymentIntentClientSecret, sessionId: session.id };
    }
  }

  // Cart: make sure every item is still for sale before charging
  if (session.type === 'cart') {
    const ids = session.items.map((i) => i.listingId);
    const live = await prisma.listing.count({ where: { id: { in: ids }, status: 'live' } });
    if (live !== ids.length) {
      _sessions.delete(session.id);
      throw new AppError('An item in your cart was just sold — please review your cart and try again', 409, 'LISTING_NOT_AVAILABLE');
    }
  }

  const amountPence = Math.round(session.totalAmount * 100);

  const metadata = session.type === 'cart'
    ? {
        checkout_session_id: session.id,
        checkout_type: 'cart',
        buyer_id: buyerId,
        listing_ids: session.items.map((i) => i.listingId).join(','),
      }
    : {
        checkout_session_id: session.id,
        listing_id: session.listingId,
        buyer_id: buyerId,
        seller_id: session.sellerId,
      };

  const pi = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: 'gbp',
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    capture_method: 'automatic',
    metadata,
    description: session.type === 'cart'
      ? `Kit Loop purchase: ${session.items.length} item${session.items.length === 1 ? '' : 's'}`
      : `Kit Loop purchase: ${session.listing.title}`,
  });

  session.paymentIntentId = pi.id;
  session.paymentIntentClientSecret = pi.client_secret;

  return { clientSecret: pi.client_secret, sessionId: session.id };
}

// ─── 5. confirmOrder ──────────────────────────────────────────────────────────
// Called by the buyer's client after Stripe.js confirms payment on the frontend.
async function confirmOrder(sessionId, buyerId, paymentIntentId) {
  const session = getCheckoutSession(sessionId, buyerId);

  if (session.paymentIntentId !== paymentIntentId) {
    throw new AppError('Payment intent does not match this session', 400, 'PI_MISMATCH');
  }

  // Verify payment with Stripe
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId);
  if (pi.status !== 'succeeded') {
    throw new AppError(`Payment not completed (status: ${pi.status})`, 402, 'PAYMENT_NOT_SUCCEEDED');
  }

  if (session.type === 'cart') return confirmCartOrder(session, buyerId, pi);

  // Idempotency: order already exists for this PaymentIntent?
  const existingPayment = await prisma.payment.findFirst({
    where: { stripePaymentIntentId: paymentIntentId },
    include: { order: true },
  });
  if (existingPayment) return existingPayment.order;

  // Determine payment method
  const pmType = pi.payment_method_types?.[0] ?? 'card';
  const paymentMethod = pmType === 'apple_pay' ? 'apple_pay'
    : pmType === 'google_pay' ? 'google_pay'
    : 'card';

  const stripeChargeId = typeof pi.latest_charge === 'string'
    ? pi.latest_charge
    : (pi.latest_charge?.id ?? null);

  const now = new Date();
  const disputeWindowDays = await getFeeValue('dispute_window_days');
  const addr = session.deliveryAddress;

  // ── Atomic transaction ────────────────────────────────────────────────────
  let order;
  try {
    order = await prisma.$transaction(async (tx) => {
      // Race-condition guard: only proceed if listing is still live
      const updated = await tx.listing.updateMany({
        where: { id: session.listingId, status: 'live' },
        data: { status: 'sold', soldAt: now },
      });
      if (updated.count === 0) {
        throw new AppError('This item was just sold to someone else', 409, 'LISTING_SOLD');
      }

      const newOrder = await tx.order.create({
        data: {
          listingId:            session.listingId,
          buyerId,
          sellerId:             session.sellerId,
          itemPrice:            session.itemPrice,
          shippingFee:          session.shippingFee,
          buyerProtectionFee:   session.buyerProtectionFee,
          platformCommission:   session.platformCommission,
          totalAmount:          session.totalAmount,
          sellerNetAmount:      session.sellerNetAmount,
          fulfilmentStatus:     'awaiting_dispatch',
          paymentStatus:        'held',
          disputeStatus:        'none',
          deliveryAddressLine1: addr.line1,
          deliveryAddressLine2: addr.line2,
          deliveryCity:         addr.city,
          deliveryPostcode:     addr.postcode,
          agreedPrice:          session.counterOfferId ? session.itemPrice : null,
          snapshotListingTitle: session.listing.title,
          snapshotCondition:    session.listing.condition,
          snapshotPhotos:       session.listing.photos,
          disputeWindowExpiresAt: new Date(now.getTime() + disputeWindowDays * 24 * 60 * 60 * 1000),
        },
      });

      await tx.payment.create({
        data: {
          orderId:               newOrder.id,
          buyerId,
          sellerId:              session.sellerId,
          stripePaymentIntentId: paymentIntentId,
          stripeChargeId,
          amountTotal:           session.totalAmount,
          amountItem:            session.itemPrice,
          amountShipping:        session.shippingFee,
          amountBuyerProtection: session.buyerProtectionFee,
          amountCommission:      session.platformCommission,
          amountSellerPayout:    session.sellerNetAmount,
          currency:              'GBP',
          paymentMethod,
          paymentStatus:         'succeeded',
          escrowStatus:          'held',
          payoutStatus:          null,
        },
      });

      // Close any related counter-offer thread
      if (session.counterOfferId) {
        await tx.counterOffer.updateMany({
          where: { id: session.counterOfferId },
          data: { status: 'accepted' },
        });
        // Close the offer thread too
        const co = await tx.counterOffer.findUnique({ where: { id: session.counterOfferId } });
        if (co) {
          await tx.offer.updateMany({
            where: { id: co.offerId },
            data: { status: 'completed' },
          });
        }
      }

      return newOrder;
    });
  } catch (err) {
    // Re-throw AppErrors (e.g. LISTING_SOLD race condition) untouched
    if (err.status) throw err;
    throw new AppError('Failed to create order', 500, 'ORDER_CREATION_FAILED');
  }

  // Destroy checkout session
  _sessions.delete(sessionId);

  // The item is bought — take it out of the buyer's cart
  prisma.cartItem.deleteMany({ where: { userId: buyerId, listingId: session.listingId } })
    .catch((e) => console.error('[cart] cleanup:', e.message));

  // Send notifications (fire-and-forget)
  notifyOrderPlaced(order).catch((e) => console.error('[notify] order_placed:', e.message));

  // Return full order with relations
  return prisma.order.findUnique({
    where: { id: order.id },
    include: {
      listing: { select: { id: true, title: true, photos: true } },
      buyer:   { select: { id: true, username: true, displayName: true } },
      seller:  { select: { id: true, username: true, displayName: true } },
      payment: true,
    },
  });
}

// ─── 5b. confirmCartOrder ─────────────────────────────────────────────────────
// One PaymentIntent → one order + payment row per item, all-or-nothing.
async function confirmCartOrder(session, buyerId, pi) {
  // Idempotency: orders already created for this PaymentIntent?
  const existing = await prisma.payment.findMany({
    where: { stripePaymentIntentId: pi.id },
    select: { orderId: true },
  });
  if (existing.length) {
    return { orders: await loadOrders(existing.map((p) => p.orderId)) };
  }

  const pmType = pi.payment_method_types?.[0] ?? 'card';
  const paymentMethod = pmType === 'apple_pay' ? 'apple_pay' : pmType === 'google_pay' ? 'google_pay' : 'card';
  const stripeChargeId = typeof pi.latest_charge === 'string' ? pi.latest_charge : (pi.latest_charge?.id ?? null);
  const now = new Date();
  const disputeWindowDays = await getFeeValue('dispute_window_days');
  const addr = session.deliveryAddress;

  let orders;
  try {
    orders = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const item of session.items) {
        // Race-condition guard: every item must still be live
        const updated = await tx.listing.updateMany({
          where: { id: item.listingId, status: 'live' },
          data: { status: 'sold', soldAt: now },
        });
        if (updated.count === 0) {
          throw new AppError(`“${item.listing.title}” was just sold to someone else`, 409, 'LISTING_SOLD');
        }

        const order = await tx.order.create({
          data: {
            listingId:            item.listingId,
            buyerId,
            sellerId:             item.sellerId,
            itemPrice:            item.itemPrice,
            shippingFee:          item.shippingFee,
            buyerProtectionFee:   item.buyerProtectionFee,
            platformCommission:   item.platformCommission,
            totalAmount:          item.totalAmount,
            sellerNetAmount:      item.sellerNetAmount,
            fulfilmentStatus:     'awaiting_dispatch',
            paymentStatus:        'held',
            disputeStatus:        'none',
            deliveryAddressLine1: addr.line1,
            deliveryAddressLine2: addr.line2,
            deliveryCity:         addr.city,
            deliveryPostcode:     addr.postcode,
            agreedPrice:          null,
            snapshotListingTitle: item.listing.title,
            snapshotCondition:    item.listing.condition,
            snapshotPhotos:       item.listing.photos,
            disputeWindowExpiresAt: new Date(now.getTime() + disputeWindowDays * 24 * 60 * 60 * 1000),
          },
        });

        await tx.payment.create({
          data: {
            orderId:               order.id,
            buyerId,
            sellerId:              item.sellerId,
            stripePaymentIntentId: pi.id,
            stripeChargeId,
            amountTotal:           item.totalAmount,
            amountItem:            item.itemPrice,
            amountShipping:        item.shippingFee,
            amountBuyerProtection: item.buyerProtectionFee,
            amountCommission:      item.platformCommission,
            amountSellerPayout:    item.sellerNetAmount,
            currency:              'GBP',
            paymentMethod,
            paymentStatus:         'succeeded',
            escrowStatus:          'held',
            payoutStatus:          null,
          },
        });

        created.push(order);
      }
      return created;
    });
  } catch (err) {
    // Payment already went through — refund it in full so the buyer isn't charged for nothing
    try {
      await stripe.refunds.create({ payment_intent: pi.id, reason: 'requested_by_customer', metadata: { checkout_session_id: session.id } });
    } catch (refundErr) {
      console.error('[cart checkout] automatic refund failed for PI', pi.id, refundErr.message);
    }
    _sessions.delete(session.id);
    if (err.status) {
      throw new AppError(`${err.message}. Your payment has been refunded in full.`, err.status, err.code);
    }
    throw new AppError('We couldn’t create your orders. Your payment has been refunded in full.', 500, 'ORDER_CREATION_FAILED');
  }

  _sessions.delete(session.id);

  // Bought items leave the buyer's cart
  prisma.cartItem.deleteMany({ where: { userId: buyerId, listingId: { in: session.items.map((i) => i.listingId) } } })
    .catch((e) => console.error('[cart] cleanup:', e.message));

  for (const order of orders) {
    notifyOrderPlaced(order).catch((e) => console.error('[notify] order_placed:', e.message));
  }

  return { orders: await loadOrders(orders.map((o) => o.id)) };
}

function loadOrders(ids) {
  return prisma.order.findMany({
    where: { id: { in: ids } },
    orderBy: { createdAt: 'asc' },
    include: {
      listing: { select: { id: true, title: true, photos: true } },
      seller:  { select: { id: true, username: true, displayName: true } },
      payment: true,
    },
  });
}

module.exports = {
  getFeeValue,
  initiateCartCheckout,
  initiateCheckout,
  getCheckoutSession,
  submitAddress,
  createPaymentIntent,
  confirmOrder,
};
