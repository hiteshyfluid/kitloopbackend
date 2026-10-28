const prisma  = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { notify } = require('./notificationService');

const DISPUTE_SELECT = {
  id: true,
  orderId: true,
  buyerId: true,
  sellerId: true,
  reason: true,
  description: true,
  evidencePhotos: true,
  sellerResponse: true,
  sellerEvidencePhotos: true,
  sellerRespondedAt: true,
  sellerResponseDeadline: true,
  status: true,
  adminId: true,
  ruling: true,
  rulingReason: true,
  refundAmount: true,
  sellerReleaseAmount: true,
  resolvedAt: true,
  createdAt: true,
  updatedAt: true,
  buyer:  { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  seller: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  order:  {
    select: {
      id: true,
      snapshotListingTitle: true,
      snapshotCondition: true,
      snapshotPhotos: true,
      totalAmount: true,
      itemPrice: true,
    },
  },
};

// ─── raiseDispute ─────────────────────────────────────────────────────────────
async function raiseDispute(orderId, buyerId, { reason, description, evidencePhotos = [] }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true, buyerId: true, sellerId: true,
      disputeStatus: true, fulfilmentStatus: true,
      paymentStatus: true, disputeWindowExpiresAt: true,
      snapshotListingTitle: true,
    },
  });

  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.buyerId !== buyerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.disputeStatus !== 'none') {
    throw new AppError('A dispute already exists for this order', 409, 'DISPUTE_EXISTS');
  }
  if (!['dispatched', 'delivered'].includes(order.fulfilmentStatus)) {
    throw new AppError('Disputes can only be raised after dispatch', 409, 'INVALID_STATUS');
  }
  if (order.disputeWindowExpiresAt && new Date(order.disputeWindowExpiresAt) < new Date()) {
    throw new AppError('The dispute window has closed for this order', 409, 'DISPUTE_WINDOW_CLOSED');
  }
  if (order.paymentStatus !== 'held') {
    throw new AppError('Escrow is not held for this order', 409, 'ESCROW_NOT_HELD');
  }

  const now = new Date();
  const sellerResponseDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const dispute = await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data:  { disputeStatus: 'active' },
    });
    return tx.dispute.create({
      data: {
        orderId,
        buyerId,
        sellerId: order.sellerId,
        reason,
        description,
        evidencePhotos:        evidencePhotos.length ? evidencePhotos : [],
        sellerResponseDeadline,
      },
      select: DISPUTE_SELECT,
    });
  });

  notify(
    order.sellerId,
    'dispute_raised',
    'A dispute has been raised',
    `The buyer raised a dispute on "${order.snapshotListingTitle}". Respond within 48 hours.`,
    dispute.id,
    'dispute'
  ).catch(() => {});

  notify(
    buyerId,
    'dispute_raised',
    'Your dispute has been submitted',
    `We've received your dispute for "${order.snapshotListingTitle}". We'll review it and get back to you — your payment is held safely while we investigate.`,
    dispute.id,
    'dispute'
  ).catch(() => {});

  notifyAdmins(dispute.id, order.snapshotListingTitle).catch(() => {});

  return dispute;
}

async function notifyAdmins(disputeId, listingTitle) {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['admin', 'super_admin'] }, accountStatus: 'active' },
    select: { id: true },
  });
  await Promise.all(
    admins.map((a) =>
      notify(a.id, 'dispute_raised', 'New dispute raised',
        `Dispute raised on "${listingTitle}". ID: ${disputeId.slice(0, 8)}.`,
        disputeId, 'dispute')
    )
  );
}

// ─── getDisputeDetail ─────────────────────────────────────────────────────────
async function getDisputeDetail(disputeId, userId) {
  const [dispute, user] = await Promise.all([
    prisma.dispute.findUnique({ where: { id: disputeId }, select: DISPUTE_SELECT }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);

  if (!dispute) throw new AppError('Dispute not found', 404, 'NOT_FOUND');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  if (!isAdmin && dispute.buyerId !== userId && dispute.sellerId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  return dispute;
}

// ─── submitSellerResponse ─────────────────────────────────────────────────────
async function submitSellerResponse(disputeId, sellerId, { response, sellerEvidencePhotos = [] }) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    select: { id: true, sellerId: true, buyerId: true, status: true, sellerResponseDeadline: true },
  });

  if (!dispute) throw new AppError('Dispute not found', 404, 'NOT_FOUND');
  if (dispute.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (!['open', 'seller_responded'].includes(dispute.status)) {
    throw new AppError('Cannot respond to a dispute that is not open', 409, 'INVALID_STATUS');
  }
  if (dispute.sellerResponseDeadline && new Date(dispute.sellerResponseDeadline) < new Date()) {
    throw new AppError('The 48-hour response window for this dispute has closed', 409, 'RESPONSE_WINDOW_CLOSED');
  }

  const updated = await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      sellerResponse:       response,
      sellerEvidencePhotos: sellerEvidencePhotos.length ? sellerEvidencePhotos : [],
      sellerRespondedAt:    new Date(),
      status:               'seller_responded',
    },
    select: DISPUTE_SELECT,
  });

  notify(
    dispute.buyerId,
    'dispute_raised',
    'Seller responded to your dispute',
    'The seller has submitted a response. Our team will now review both sides.',
    disputeId,
    'dispute'
  ).catch(() => {});

  return updated;
}

module.exports = { raiseDispute, getDisputeDetail, submitSellerResponse };
