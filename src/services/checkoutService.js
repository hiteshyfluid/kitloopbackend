const { randomUUID } = require('crypto');
const prisma = require('../lib/prisma');
const stripe = require('../lib/stripe');
const AppError = require('../utils/AppError');
const { notifyOrderPlaced } = require('./notificationService');

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

  // Ensure buyer has a Stripe customer ID
  const buyer = await prisma.user.findUnique({ where: { id: buyerId } });
  let stripeCustomerId = buyer.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: buyer.email,
      name: buyer.displayName || buyer.username,
      metadata: { user_id: buyer.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: buyerId },
      data: { stripeCustomerId },
    });
  }

  // Create or reuse an existing PaymentIntent for this session
  if (session.paymentIntentId) {
    const existing = await stripe.paymentIntents.retrieve(session.paymentIntentId);
    if (existing.status === 'requires_payment_method' || existing.status === 'requires_confirmation') {
      return { clientSecret: session.paymentIntentClientSecret, sessionId: session.id };
    }
  }

  const amountPence = Math.round(session.totalAmount * 100);

  const pi = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: 'gbp',
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    capture_method: 'automatic',
    metadata: {
      checkout_session_id: session.id,
      listing_id: session.listingId,
      buyer_id: buyerId,
      seller_id: session.sellerId,
    },
    description: `Kit Loop purchase: ${session.listing.title}`,
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

  // Idempotency: order already exists for this PaymentIntent?
  const existingPayment = await prisma.payment.findUnique({
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

module.exports = {
  initiateCheckout,
  getCheckoutSession,
  submitAddress,
  createPaymentIntent,
  confirmOrder,
};
