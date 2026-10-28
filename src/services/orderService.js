const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { notifyDispatched, notifyDeliveryConfirmed } = require('./notificationService');

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
      trackingNumber:         trackingNumber || null,
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
};
