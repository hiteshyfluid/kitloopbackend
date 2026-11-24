const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const stripe = require('../lib/stripe');
const {
  notifyDispatched, notifyDeliveryConfirmed, notifyOrderCancelled, notifyArrived, notifyAwaitingCollection,
} = require('./notificationService');
const { cancelLabel, COLLECTION_HOLD_DAYS } = require('./shippingService');

// ─── Shared select ────────────────────────────────────────────────────────────
const ORDER_SELECT = {
  id: true,
  listingId: true,
  buyerId: true,
  sellerId: true,
  itemPrice: true,
  shippingFee: true,
  buyerProtectionFee: true,
  platformCommission: true,
  totalAmount: true,
  sellerNetAmount: true,
  fulfilmentStatus: true,
  paymentStatus: true,
  disputeStatus: true,
  trackingNumber: true,
  dispatchedAt: true,
  deliveredAt: true,
  completedAt: true,
  deliveryAddressLine1: true,
  deliveryAddressLine2: true,
  deliveryCity: true,
  deliveryPostcode: true,
  deliveryName: true,
  deliveryPhone: true,
  shippingCourier: true,
  shippingServiceId: true,
  shippingReference: true,
  labelUrl: true,
  labelCreatedAt: true,
  labelFormat: true,
  trackingUrl: true,
  deliveryMethod: true,
  dropOffBy: true,
  dropOffQrMime: true,
  dropOffCode: true,
  trackingStatus: true,
  trackingStatusText: true,
  trackingStatusAt: true,
  collectionPointName: true,
  collectionPointAddress: true,
  collectBy: true,
  cancelledAt: true,
  cancelReason: true,
  agreedPrice: true,
  snapshotListingTitle: true,
  snapshotCondition: true,
  snapshotPhotos: true,
  disputeWindowExpiresAt: true,
  createdAt: true,
  updatedAt: true,
  listing: { select: { id: true, title: true, photos: true, parcelSize: true } },
  buyer:   { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  seller:  { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  payment: {
    select: {
      id: true,
      paymentStatus: true,
      escrowStatus: true,
      payoutStatus: true,
      amountTotal: true,
      amountSellerPayout: true,
      amountRefunded: true,
      currency: true,
      paymentMethod: true,
      stripePaymentIntentId: true,
    },
  },
  dispute: {
    select: {
      id: true, status: true, reason: true, description: true,
      evidencePhotos: true, sellerResponse: true, sellerEvidencePhotos: true,
      sellerRespondedAt: true, sellerResponseDeadline: true,
      ruling: true, rulingReason: true, resolvedAt: true, createdAt: true,
    },
  },
  review: {
    select: { id: true, rating: true, body: true, createdAt: true },
  },
};

// ─── getOrder ─────────────────────────────────────────────────────────────────
async function getOrder(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: ORDER_SELECT,
  });

  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.buyerId !== userId && order.sellerId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }
  return order;
}

// ─── getMyPurchases ───────────────────────────────────────────────────────────
async function getMyPurchases(buyerId, { page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { buyerId },
      select: ORDER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { buyerId } }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── getMySales ───────────────────────────────────────────────────────────────
async function getMySales(sellerId, { page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where: { sellerId },
      select: ORDER_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.order.count({ where: { sellerId } }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── dispatchOrder ────────────────────────────────────────────────────────────
async function dispatchOrder(orderId, sellerId, trackingNumber) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.fulfilmentStatus !== 'awaiting_dispatch') {
    throw new AppError(
      `Cannot dispatch an order with status: ${order.fulfilmentStatus}`,
      409,
      'INVALID_STATUS'
    );
  }

  const disputeWindowDays = await getDisputeWindowDays();
  const now = new Date();

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      fulfilmentStatus:       'dispatched',
      // Keep the label's tracking number if the seller leaves the field blank
      trackingNumber:         trackingNumber || order.trackingNumber || null,
      dispatchedAt:           now,
      disputeWindowExpiresAt: new Date(now.getTime() + disputeWindowDays * 24 * 60 * 60 * 1000),
    },
    select: ORDER_SELECT,
  });

  notifyDispatched(updated).catch((e) => console.error('[notify] dispatched:', e.message));

  return updated;
}

// ─── confirmDelivery ──────────────────────────────────────────────────────────
async function confirmDelivery(orderId, buyerId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true },
  });

  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.buyerId !== buyerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  const allowed = ['dispatched', 'delivered'];
  if (!allowed.includes(order.fulfilmentStatus)) {
    throw new AppError(
      `Cannot confirm delivery for order with status: ${order.fulfilmentStatus}`,
      409,
      'INVALID_STATUS'
    );
  }
  if (order.paymentStatus === 'released') {
    throw new AppError('Escrow already released for this order', 409, 'ALREADY_RELEASED');
  }

  const now = new Date();

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        fulfilmentStatus: 'completed',
        paymentStatus:    'released',
        deliveredAt:      order.deliveredAt ?? now,
        completedAt:      now,
      },
      select: ORDER_SELECT,
    }),
    prisma.payment.update({
      where: { orderId },
      data: {
        escrowStatus: 'released',
        payoutStatus: 'pending',
      },
    }),
  ]);

  notifyDeliveryConfirmed(updatedOrder).catch((e) =>
    console.error('[notify] delivery_confirmed:', e.message)
  );

  return updatedOrder;
}

// ─── releaseEscrow (shared by confirmDelivery and autoRelease cron) ───────────
async function releaseEscrow(orderId) {
  const now = new Date();

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        fulfilmentStatus: 'completed',
        paymentStatus:    'released',
        completedAt:      now,
      },
      select: ORDER_SELECT,
    }),
    prisma.payment.update({
      where: { orderId },
      data: {
        escrowStatus: 'released',
        payoutStatus: 'pending',
      },
    }),
  ]);

  return updatedOrder;
}

// ─── cancelUnshippedOrder ─────────────────────────────────────────────────────
// The seller missed the dispatch deadline: cancel, refund the buyer in full,
// void any unused label and put the item back on sale. Called by the
// dispatchDeadline job. The order is claimed first so a seller marking it as
// dispatched at the same moment can't race the refund.
async function cancelUnshippedOrder(orderId, reason) {
  const now = new Date();
  const claimed = await prisma.order.updateMany({
    where: { id: orderId, fulfilmentStatus: 'awaiting_dispatch', paymentStatus: 'held', disputeStatus: 'none' },
    data:  { fulfilmentStatus: 'cancelled', cancelledAt: now, cancelReason: reason },
  });
  if (!claimed.count) return null;

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { payment: true, listing: { select: { id: true, status: true } }, seller: { select: { accountStatus: true } } },
  });

  let refund;
  try {
    refund = await stripe.refunds.create(
      {
        payment_intent: order.payment.stripePaymentIntentId,
        amount: Math.round(Number(order.payment.amountTotal) * 100),
        reason: 'requested_by_customer',
        metadata: { order_id: order.id, cause: 'not_dispatched' },
      },
      // One refund per order, however many times this runs
      { idempotencyKey: `kitloop-cancel-${order.id}` },
    );
  } catch (err) {
    // Put the order back so it can be retried (or handled by an admin)
    await prisma.order.update({
      where: { id: orderId },
      data:  { fulfilmentStatus: 'awaiting_dispatch', cancelledAt: null, cancelReason: null },
    });
    throw err;
  }

  const relist = order.listing.status === 'sold' && order.seller.accountStatus === 'active';
  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { orderId },
      data: {
        escrowStatus: 'refunded',
        paymentStatus: 'refunded',
        stripeRefundId: refund.id,
        amountRefunded: order.payment.amountTotal,
        refundReason: reason,
        shippingFeeRefunded: true,
      },
    });
    if (relist) {
      await tx.listing.update({ where: { id: order.listingId }, data: { status: 'live', soldAt: null } });
    }
    return tx.order.update({
      where: { id: orderId },
      data:  { paymentStatus: 'refunded' },
      select: ORDER_SELECT,
    });
  });

  cancelLabel(order);
  notifyOrderCancelled(updated).catch((e) => console.error('[notify] order_cancelled:', e.message));
  return updated;
}

// ─── applyTrackingUpdate ──────────────────────────────────────────────────────
// One courier tracking event (normalised by shippingService). Matches the order
// by our label reference, else the tracking number, records the event and
// moves the order on: collected → dispatched, at a shop → awaiting collection,
// delivered → delivered (the buyer's issue window starts now).
async function applyTrackingUpdate(update) {
  const match = [
    update.reference && { shippingReference: String(update.reference) },
    update.trackingNumber && { trackingNumber: String(update.trackingNumber) },
  ].filter(Boolean);
  if (!match.length) return { matched: false };

  const order = await prisma.order.findFirst({ where: { OR: match }, orderBy: { createdAt: 'desc' } });
  if (!order) return { matched: false };

  const events = Array.isArray(order.trackingEvents) ? order.trackingEvents : [];
  const event = { status: update.status, text: update.text, at: update.at.toISOString() };
  if (events.some((e) => e.text === event.text && e.at === event.at)) {
    return { matched: true, orderId: order.id, duplicate: true };
  }

  const data = {
    trackingEvents: [event, ...events].slice(0, 30),
    ...(update.status ? { trackingStatus: update.status } : {}),
    trackingStatusText: update.text,
    trackingStatusAt: update.at,
  };

  const open = !['completed', 'cancelled'].includes(order.fulfilmentStatus);
  const now = new Date();
  const after = [];

  if (open && order.fulfilmentStatus === 'awaiting_dispatch'
    && ['in_transit', 'out_for_delivery', 'awaiting_collection', 'delivered'].includes(update.status)) {
    const disputeWindowDays = await getDisputeWindowDays();
    Object.assign(data, {
      fulfilmentStatus: 'dispatched',
      dispatchedAt: update.at,
      disputeWindowExpiresAt: new Date(now.getTime() + disputeWindowDays * 86_400_000),
    });
    after.push('dispatched');
  }

  if (open && update.status === 'awaiting_collection' && order.trackingStatus !== 'awaiting_collection') {
    Object.assign(data, {
      collectionPointName: update.collectionPoint?.name ?? order.collectionPointName,
      collectionPointAddress: update.collectionPoint?.address ?? order.collectionPointAddress,
      collectBy: update.collectBy ?? new Date(update.at.getTime() + COLLECTION_HOLD_DAYS * 86_400_000),
      collectionReminderSentAt: null,
    });
    after.push('awaiting_collection');
  }

  if (open && update.status === 'delivered' && ['awaiting_dispatch', 'dispatched'].includes(order.fulfilmentStatus)) {
    // The buyer's issue window runs from delivery
    const disputeWindowDays = await getDisputeWindowDays();
    Object.assign(data, {
      fulfilmentStatus: 'delivered',
      deliveredAt: update.at,
      disputeWindowExpiresAt: new Date(now.getTime() + disputeWindowDays * 86_400_000),
    });
    after.push('delivered');
  }

  const updated = await prisma.order.update({ where: { id: order.id }, data, select: ORDER_SELECT });

  if (after.includes('dispatched')) notifyDispatched(updated).catch((e) => console.error('[notify] dispatched:', e.message));
  if (after.includes('awaiting_collection')) notifyAwaitingCollection(updated).catch((e) => console.error('[notify] awaiting_collection:', e.message));
  if (after.includes('delivered')) notifyArrived(updated).catch((e) => console.error('[notify] delivered:', e.message));

  return { matched: true, orderId: order.id, status: update.status };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────
async function getDisputeWindowDays() {
  try {
    const row = await prisma.feeConfig.findUnique({ where: { configKey: 'dispute_window_days' } });
    return row ? Number(row.configValue) : 2;
  } catch {
    return 2;
  }
}

module.exports = {
  getOrder,
  getMyPurchases,
  getMySales,
  dispatchOrder,
  confirmDelivery,
  releaseEscrow,
  cancelUnshippedOrder,
  applyTrackingUpdate,
};
