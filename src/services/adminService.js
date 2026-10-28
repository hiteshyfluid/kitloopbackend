'use strict';

const prisma = require('../lib/prisma');
const stripe = require('../lib/stripe');
const AppError = require('../utils/AppError');
const { notify } = require('./notificationService');

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function pence(amount) {
  return Math.round(Number(amount) * 100);
}

async function allAdminIds() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ['admin', 'super_admin'] }, accountStatus: 'active' },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}

// ─── LISTINGS ─────────────────────────────────────────────────────────────────

async function listListings({ status, search, page = 1, pageSize = 20 } = {}) {
  const where = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { seller: { displayName: { contains: search, mode: 'insensitive' } } },
      { seller: { username:    { contains: search, mode: 'insensitive' } } },
    ];
  }

  const skip  = (page - 1) * pageSize;
  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true, title: true, status: true, price: true, condition: true,
        photos: true, flagReason: true, removalReason: true, publishedAt: true,
        createdAt: true,
        seller: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        sport:  { select: { id: true, name: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return { listings, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

async function getListingDetail(listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      seller:      { select: { id: true, displayName: true, username: true, email: true, avatarUrl: true, accountStatus: true, violationCount: true } },
      sport:       { select: { id: true, name: true } },
      subCategory: { select: { id: true, name: true } },
      brand:       { select: { id: true, name: true } },
      orders:      { select: { id: true, createdAt: true, fulfilmentStatus: true, paymentStatus: true }, orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');
  return listing;
}

async function flagListing(listingId, adminId, { reason, internalNote } = {}) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, status: true, sellerId: true, title: true } });
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');
  if (listing.status === 'removed') throw new AppError('Listing is already removed', 409, 'INVALID_STATUS');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.listing.update({
      where: { id: listingId },
      data:  { status: 'flagged', flagReason: reason },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'listing_flagged', targetType: 'listing', targetId: listingId,
        previousValue: { status: listing.status },
        newValue:      { status: 'flagged', flagReason: reason },
        reason, internalNote,
      },
    });
    return result;
  });

  notify(listing.sellerId, 'listing_flagged', 'Your listing has been flagged',
    `"${listing.title}" has been flagged for review: ${reason}`, listingId, 'listing').catch(() => {});

  return updated;
}

async function removeListing(listingId, adminId, { reason, internalNote } = {}) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, status: true, sellerId: true, title: true } });
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');
  if (listing.status === 'removed') throw new AppError('Listing is already removed', 409, 'INVALID_STATUS');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.listing.update({
      where: { id: listingId },
      data:  { status: 'removed', removalReason: reason },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'listing_removed', targetType: 'listing', targetId: listingId,
        previousValue: { status: listing.status },
        newValue:      { status: 'removed', removalReason: reason },
        reason, internalNote,
      },
    });
    return result;
  });

  notify(listing.sellerId, 'listing_removed', 'Your listing has been removed',
    `"${listing.title}" has been removed: ${reason}`, listingId, 'listing').catch(() => {});

  return updated;
}

async function restoreListing(listingId, adminId, { internalNote } = {}) {
  const listing = await prisma.listing.findUnique({ where: { id: listingId }, select: { id: true, status: true, sellerId: true, title: true } });
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');
  if (!['flagged', 'removed'].includes(listing.status)) throw new AppError('Only flagged or removed listings can be restored', 409, 'INVALID_STATUS');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.listing.update({
      where: { id: listingId },
      data:  { status: 'live', flagReason: null, removalReason: null },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'listing_restored', targetType: 'listing', targetId: listingId,
        previousValue: { status: listing.status },
        newValue:      { status: 'live' },
        internalNote,
      },
    });
    return result;
  });

  return updated;
}

const FEATURED_LIMIT = 8;

const FEATURABLE_LISTING_SELECT = {
  id: true, title: true, price: true, photos: true, status: true,
  isFeatured: true, featuredAt: true, publishedAt: true,
  seller: { select: { id: true, displayName: true, username: true, accountStatus: true } },
  sport:  { select: { id: true, name: true } },
};

async function getFeaturedListingsAdmin({ search } = {}) {
  const eligibleWhere = {
    status: 'live',
    isFeatured: false,
    seller: { accountStatus: 'active' },
  };
  if (search) {
    eligibleWhere.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { seller: { displayName: { contains: search, mode: 'insensitive' } } },
      { brand:  { name: { contains: search, mode: 'insensitive' } } },
    ];
  }

  const [featured, eligible] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'live', isFeatured: true },
      orderBy: { featuredAt: 'desc' },
      select: FEATURABLE_LISTING_SELECT,
    }),
    prisma.listing.findMany({
      where: eligibleWhere,
      orderBy: { publishedAt: 'desc' },
      take: 50,
      select: FEATURABLE_LISTING_SELECT,
    }),
  ]);

  return { featured, eligible, limit: FEATURED_LIMIT };
}

async function setListingFeatured(listingId, adminId, featured, { internalNote } = {}) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true, status: true, isFeatured: true, publishedAt: true, title: true,
      seller: { select: { accountStatus: true } },
    },
  });
  if (!listing) throw new AppError('Listing not found', 404, 'NOT_FOUND');

  if (featured) {
    if (listing.isFeatured) throw new AppError('Listing is already featured', 409, 'ALREADY_FEATURED');
    if (listing.status !== 'live') throw new AppError('Only live listings can be featured', 409, 'INVALID_STATUS');
    if (listing.seller.accountStatus !== 'active') throw new AppError('Listing seller is not active', 409, 'SELLER_INACTIVE');
    const currentCount = await prisma.listing.count({ where: { status: 'live', isFeatured: true } });
    if (currentCount >= FEATURED_LIMIT) {
      throw new AppError(`Featured grid is full (${FEATURED_LIMIT}/${FEATURED_LIMIT}). Remove one before adding another.`, 409, 'FEATURED_LIMIT_REACHED');
    }
  } else if (!listing.isFeatured) {
    throw new AppError('Listing is not currently featured', 409, 'NOT_FEATURED');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.listing.update({
      where: { id: listingId },
      data:  { isFeatured: featured, featuredAt: featured ? new Date() : null },
      select: FEATURABLE_LISTING_SELECT,
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'listing_featured', targetType: 'listing', targetId: listingId,
        previousValue: { isFeatured: listing.isFeatured },
        newValue:      { isFeatured: featured },
        internalNote,
      },
    });
    return result;
  });

  return updated;
}

// ─── USERS ────────────────────────────────────────────────────────────────────

async function listUsers({ search, role, status, page = 1, pageSize = 20 } = {}) {
  const where = {};
  if (role)   where.role          = role;
  if (status) where.accountStatus = status;
  if (search) {
    where.OR = [
      { email:       { contains: search, mode: 'insensitive' } },
      { username:    { contains: search, mode: 'insensitive' } },
      { displayName: { contains: search, mode: 'insensitive' } },
    ];
  }

  const skip  = (page - 1) * pageSize;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true, email: true, username: true, displayName: true, avatarUrl: true,
        role: true, accountStatus: true, verifiedSeller: true, violationCount: true,
        totalSales: true, averageRating: true, reviewCount: true,
        suspensionEndDate: true, suspensionReason: true, createdAt: true, lastActiveAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

async function getUserDetail(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true, email: true, username: true, displayName: true, avatarUrl: true,
      role: true, accountStatus: true, verifiedSeller: true, violationCount: true,
      totalSales: true, averageRating: true, reviewCount: true,
      suspensionEndDate: true, suspensionReason: true,
      stripeConnectId: true, stripeCustomerId: true,
      holidayMode: true, createdAt: true, updatedAt: true, lastActiveAt: true, deletedAt: true,
      sellerBadgesSeller: { orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, action: true, reason: true, createdAt: true } },
    },
  });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  return user;
}

async function suspendUser(userId, adminId, { reason, durationDays, internalNote } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, accountStatus: true, displayName: true } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (user.accountStatus === 'banned') throw new AppError('User is already banned', 409, 'INVALID_STATUS');
  if (user.accountStatus === 'deleted') throw new AppError('Cannot modify deleted account', 409, 'INVALID_STATUS');

  const suspensionEndDate = durationDays
    ? new Date(Date.now() + Number(durationDays) * 24 * 60 * 60 * 1000)
    : null;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({
      where: { id: userId },
      data:  { accountStatus: 'suspended', suspensionReason: reason, suspensionEndDate },
    });
    await tx.session.updateMany({
      where:  { userId, revokedAt: null },
      data:   { revokedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'user_suspended', targetType: 'user', targetId: userId,
        previousValue: { accountStatus: user.accountStatus },
        newValue:      { accountStatus: 'suspended', reason, durationDays, suspensionEndDate },
        reason, internalNote,
      },
    });
    return result;
  });

  notify(userId, 'account_suspended', 'Your account has been suspended',
    `Your account has been suspended${durationDays ? ` for ${durationDays} days` : ''}. Reason: ${reason}`, userId, 'user').catch(() => {});

  return updated;
}

async function banUser(userId, adminId, { reason, internalNote } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, accountStatus: true } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (user.accountStatus === 'banned') throw new AppError('User is already banned', 409, 'INVALID_STATUS');
  if (user.accountStatus === 'deleted') throw new AppError('Cannot modify deleted account', 409, 'INVALID_STATUS');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({
      where: { id: userId },
      data:  { accountStatus: 'banned', suspensionReason: reason, suspensionEndDate: null },
    });
    await tx.session.updateMany({
      where:  { userId, revokedAt: null },
      data:   { revokedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'user_banned', targetType: 'user', targetId: userId,
        previousValue: { accountStatus: user.accountStatus },
        newValue:      { accountStatus: 'banned', reason },
        reason, internalNote,
      },
    });
    return result;
  });

  notify(userId, 'account_suspended', 'Your account has been banned',
    `Your account has been permanently banned. Reason: ${reason}`, userId, 'user').catch(() => {});

  return updated;
}

async function reinstateUser(userId, adminId, { internalNote } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, accountStatus: true } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (!['suspended', 'banned'].includes(user.accountStatus)) throw new AppError('User is not suspended or banned', 409, 'INVALID_STATUS');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.user.update({
      where: { id: userId },
      data:  { accountStatus: 'active', suspensionEndDate: null, suspensionReason: null },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'user_reinstated', targetType: 'user', targetId: userId,
        previousValue: { accountStatus: user.accountStatus },
        newValue:      { accountStatus: 'active' },
        internalNote,
      },
    });
    return result;
  });

  return updated;
}

async function hardDeleteUser(userId, adminId, { internalNote } = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, accountStatus: true, deletedAt: true } });
  if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (user.deletedAt) throw new AppError('User already deleted', 409, 'INVALID_STATUS');

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data:  { deletedAt: new Date(), accountStatus: 'deleted' },
    });
    await tx.session.updateMany({
      where:  { userId, revokedAt: null },
      data:   { revokedAt: new Date() },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'user_banned', targetType: 'user', targetId: userId,
        previousValue: { accountStatus: user.accountStatus },
        newValue:      { accountStatus: 'deleted' },
        reason: 'Admin hard delete', internalNote,
      },
    });
  });
}

// ─── ORDERS ───────────────────────────────────────────────────────────────────

async function listOrders({ status, page = 1, pageSize = 20 } = {}) {
  const where = {};
  if (status) where.fulfilmentStatus = status;

  const skip  = (page - 1) * pageSize;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true, snapshotListingTitle: true, itemPrice: true, totalAmount: true,
        fulfilmentStatus: true, paymentStatus: true, disputeStatus: true, createdAt: true,
        buyer:  { select: { id: true, displayName: true, username: true } },
        seller: { select: { id: true, displayName: true, username: true } },
        dispute: { select: { id: true, status: true, ruling: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

async function listFlaggedOrders({ page = 1, pageSize = 20 } = {}) {
  const where = { disputeStatus: { not: 'none' }, dispute: { status: { in: ['admin_reviewing', 'open'] } } };
  const skip  = (page - 1) * pageSize;

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true, snapshotListingTitle: true, itemPrice: true, totalAmount: true,
        fulfilmentStatus: true, paymentStatus: true, disputeStatus: true, createdAt: true,
        buyer:   { select: { id: true, displayName: true, username: true } },
        seller:  { select: { id: true, displayName: true, username: true } },
        dispute: { select: { id: true, status: true, reason: true, createdAt: true, sellerResponseDeadline: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── DISPUTES ─────────────────────────────────────────────────────────────────

async function listDisputes({ status, page = 1, pageSize = 20 } = {}) {
  const where = {};
  if (status) where.status = status;

  const skip  = (page - 1) * pageSize;
  const [disputes, total] = await Promise.all([
    prisma.dispute.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true, reason: true, status: true, ruling: true,
        sellerResponseDeadline: true, createdAt: true,
        buyer:  { select: { id: true, displayName: true, username: true } },
        seller: { select: { id: true, displayName: true, username: true } },
        order:  { select: { id: true, snapshotListingTitle: true, totalAmount: true } },
      },
    }),
    prisma.dispute.count({ where }),
  ]);

  return { disputes, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

async function getDisputeDetail(disputeId) {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      buyer:  { select: { id: true, displayName: true, username: true, avatarUrl: true } },
      seller: { select: { id: true, displayName: true, username: true, avatarUrl: true, violationCount: true } },
      admin:  { select: { id: true, displayName: true } },
      order:  {
        select: {
          id: true, snapshotListingTitle: true, snapshotCondition: true, snapshotPhotos: true,
          itemPrice: true, totalAmount: true, shippingFee: true, sellerNetAmount: true,
          fulfilmentStatus: true, paymentStatus: true,
          payment: { select: { id: true, stripePaymentIntentId: true, amountTotal: true, amountRefunded: true, escrowStatus: true } },
        },
      },
    },
  });
  if (!dispute) throw new AppError('Dispute not found', 404, 'NOT_FOUND');
  return dispute;
}

async function ruleDispute(disputeId, adminId, { ruling, rulingReason, refundAmount, sellerReleaseAmount, shippingFeeRefunded = false } = {}) {
  const dispute = await prisma.dispute.findUnique({
    where:   { id: disputeId },
    include: {
      buyer:  { select: { id: true, displayName: true } },
      seller: { select: { id: true, stripeConnectId: true } },
      order:  {
        include: {
          listing: { select: { id: true } },
          payment: { select: { id: true, stripePaymentIntentId: true, stripeChargeId: true, escrowStatus: true } },
        },
      },
    },
  });

  if (!dispute) throw new AppError('Dispute not found', 404, 'NOT_FOUND');
  if (!['open', 'seller_responded', 'admin_reviewing'].includes(dispute.status)) {
    throw new AppError('Dispute cannot be ruled in its current status', 409, 'INVALID_STATUS');
  }

  const payment = dispute.order.payment;
  if (!payment) throw new AppError('Payment record not found for this order', 500, 'PAYMENT_NOT_FOUND');

  // Stripe + DB in a single transaction so Stripe failure rolls back DB
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    // ── Stripe calls first; any exception propagates and rolls back tx ──
    let stripeRefundId     = null;
    let stripeTransferId   = null;

    if (ruling === 'refund_buyer' || ruling === 'partial_resolution') {
      const amountPence = pence(refundAmount);
      if (!amountPence || amountPence <= 0) throw new AppError('refundAmount is required for this ruling', 400, 'VALIDATION_ERROR');
      const refund = await stripe.refunds.create({
        payment_intent: payment.stripePaymentIntentId,
        amount: amountPence,
        reason: 'requested_by_customer',
        metadata: { dispute_id: disputeId, admin_id: adminId },
      });
      stripeRefundId = refund.id;
    }

    if (ruling === 'release_seller' || ruling === 'partial_resolution') {
      if (!dispute.seller.stripeConnectId) {
        throw new AppError('Seller has no Stripe Connect account; cannot transfer funds', 400, 'NO_STRIPE_CONNECT');
      }
      const amountPence = pence(sellerReleaseAmount);
      if (!amountPence || amountPence <= 0) throw new AppError('sellerReleaseAmount is required for this ruling', 400, 'VALIDATION_ERROR');
      const transfer = await stripe.transfers.create({
        amount:      amountPence,
        currency:    'gbp',
        destination: dispute.seller.stripeConnectId,
        metadata:    { dispute_id: disputeId, order_id: dispute.orderId, admin_id: adminId },
      });
      stripeTransferId = transfer.id;
    }

    // ── DB updates ──
    const orderPaymentStatus  = ruling === 'refund_buyer'  ? 'refunded'
                              : ruling === 'release_seller' ? 'released'
                              : 'partially_refunded';
    const escrowStatus        = ruling === 'refund_buyer'  ? 'refunded'
                              : ruling === 'release_seller' ? 'released'
                              : 'partially_refunded';
    const payoutStatus        = (ruling === 'release_seller' || ruling === 'partial_resolution') ? 'initiated' : undefined;

    await tx.dispute.update({
      where: { id: disputeId },
      data: {
        status: 'resolved', adminId, ruling, rulingReason,
        refundAmount:         refundAmount          ?? undefined,
        sellerReleaseAmount:  sellerReleaseAmount   ?? undefined,
        shippingFeeRefunded,
        resolvedAt: now,
      },
    });

    await tx.order.update({
      where: { id: dispute.orderId },
      data:  { paymentStatus: orderPaymentStatus, disputeStatus: 'resolved', completedAt: now },
    });

    await tx.payment.update({
      where: { orderId: dispute.orderId },
      data: {
        escrowStatus,
        ...(payoutStatus        ? { payoutStatus, payoutInitiatedAt: now } : {}),
        ...(stripeRefundId      ? { stripeRefundId, amountRefunded: refundAmount } : {}),
        ...(stripeTransferId    ? { stripeTransferId } : {}),
        refundReason: rulingReason,
        shippingFeeRefunded,
      },
    });

    await tx.auditLog.create({
      data: {
        adminId, actionType: 'dispute_ruled', targetType: 'dispute', targetId: disputeId,
        newValue: { ruling, rulingReason, refundAmount, sellerReleaseAmount, shippingFeeRefunded },
        reason: rulingReason,
      },
    });
  });

  // ── Post-transaction: buyer-favour violation tracking ──
  if (ruling === 'refund_buyer' || ruling === 'partial_resolution') {
    await handleBuyerFavourViolation(dispute, adminId).catch((err) =>
      console.error('[ruleDispute] Violation tracking failed:', err.message)
    );
  }

  // ── Notifications ──
  await Promise.all([
    notify(dispute.buyerId,  'dispute_resolved', 'Dispute resolved',
      `Your dispute for "${dispute.order.snapshotListingTitle ?? 'your order'}" has been resolved.`,
      disputeId, 'dispute'),
    notify(dispute.sellerId, 'dispute_resolved', 'Dispute resolved',
      `The dispute on your order has been resolved.`, disputeId, 'dispute'),
  ]).catch(() => {});
}

async function handleBuyerFavourViolation(dispute, adminId) {
  const updatedSeller = await prisma.user.update({
    where:  { id: dispute.sellerId },
    data:   { violationCount: { increment: 1 } },
    select: { id: true, violationCount: true },
  });

  // Flag the listing
  await prisma.listing.update({
    where: { id: dispute.order.listing.id },
    data:  { status: 'flagged', flagReason: "Dispute ruled in buyer's favour" },
  }).catch(() => {});

  // Escalate if >= 3 buyer-favour rulings in last 90 days
  const since90 = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const recentViolations = await prisma.dispute.count({
    where: {
      sellerId:   dispute.sellerId,
      status:     'resolved',
      ruling:     'refund_buyer',
      resolvedAt: { gte: since90 },
    },
  });

  if (recentViolations >= 3) {
    const adminIds = await allAdminIds();
    await Promise.all(adminIds.map((aId) =>
      notify(aId, 'account_suspended',
        `Seller escalation: ${recentViolations} violations in 90 days`,
        `Seller (ID: ${dispute.sellerId}) has ${recentViolations} buyer-favour dispute rulings in the last 90 days. Consider suspension.`,
        dispute.sellerId, 'user')
    )).catch(() => {});
  }
}

async function requestEvidence(disputeId, adminId, { deadline, internalNote } = {}) {
  const dispute = await prisma.dispute.findUnique({
    where:  { id: disputeId },
    select: { id: true, status: true, buyerId: true, sellerId: true },
  });
  if (!dispute) throw new AppError('Dispute not found', 404, 'NOT_FOUND');
  if (dispute.status === 'resolved' || dispute.status === 'closed') {
    throw new AppError('Cannot request evidence on a resolved dispute', 409, 'INVALID_STATUS');
  }

  const evidenceDeadline = deadline ? new Date(deadline) : new Date(Date.now() + 48 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.dispute.update({
      where: { id: disputeId },
      data:  {
        additionalEvidenceRequested: true,
        additionalEvidenceDeadline:  evidenceDeadline,
        status: 'admin_reviewing',
        adminId,
      },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'dispute_ruled', targetType: 'dispute', targetId: disputeId,
        newValue: { action: 'evidence_requested', deadline: evidenceDeadline },
        internalNote,
      },
    });
  });

  await Promise.all([
    notify(dispute.buyerId,  'dispute_raised', 'Additional evidence requested',
      `The admin has requested additional evidence for your dispute. Please submit by ${evidenceDeadline.toLocaleDateString('en-GB')}.`,
      disputeId, 'dispute'),
    notify(dispute.sellerId, 'dispute_raised', 'Additional evidence requested',
      `The admin has requested additional evidence for the dispute on your sale. Please submit by ${evidenceDeadline.toLocaleDateString('en-GB')}.`,
      disputeId, 'dispute'),
  ]).catch(() => {});
}

// ─── CATEGORIES ───────────────────────────────────────────────────────────────

async function listAdminSports() {
  return prisma.sport.findMany({
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    include: {
      subCategories: {
        orderBy: { displayOrder: 'asc' },
        select: { id: true, name: true, slug: true, recommendedParcelSize: true, status: true },
      },
    },
  });
}

async function unhideSport(sportId, adminId) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId }, select: { id: true, status: true, name: true } });
  if (!sport) throw new AppError('Sport not found', 404, 'NOT_FOUND');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.sport.update({ where: { id: sportId }, data: { status: 'active' } });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'sport_unhidden', targetType: 'sport', targetId: sportId,
        previousValue: { status: sport.status },
        newValue:      { status: 'active' },
      },
    });
    return result;
  });

  return updated;
}

async function createSport(adminId, { name, iconUrl, sportTag, displayOrder = 0, seasonalHighlight = false, seasonalHighlightStart, seasonalHighlightEnd } = {}) {
  const slug = slugify(name);

  const sport = await prisma.$transaction(async (tx) => {
    const result = await tx.sport.create({
      data: { name, slug, iconUrl, sportTag, displayOrder, seasonalHighlight, seasonalHighlightStart, seasonalHighlightEnd },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'sport_added', targetType: 'sport', targetId: result.id,
        newValue: { name, slug, sportTag },
      },
    });
    return result;
  });

  return sport;
}

async function updateSport(sportId, adminId, { name, iconUrl, sportTag, displayOrder, status, seasonalHighlight, seasonalHighlightStart, seasonalHighlightEnd } = {}) {
  const existing = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!existing) throw new AppError('Sport not found', 404, 'NOT_FOUND');

  const data = {};
  if (name !== undefined) { data.name = name; data.slug = slugify(name); }
  if (iconUrl              !== undefined) data.iconUrl              = iconUrl;
  if (sportTag             !== undefined) data.sportTag             = sportTag;
  if (displayOrder         !== undefined) data.displayOrder         = displayOrder;
  if (status               !== undefined) data.status               = status;
  if (seasonalHighlight    !== undefined) data.seasonalHighlight    = seasonalHighlight;
  if (seasonalHighlightStart !== undefined) data.seasonalHighlightStart = seasonalHighlightStart;
  if (seasonalHighlightEnd   !== undefined) data.seasonalHighlightEnd   = seasonalHighlightEnd;

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.sport.update({ where: { id: sportId }, data });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'category_edited', targetType: 'sport', targetId: sportId,
        previousValue: { name: existing.name, status: existing.status },
        newValue:      data,
      },
    });
    return result;
  });

  return updated;
}

async function hideSport(sportId, adminId, { internalNote } = {}) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId }, select: { id: true, status: true, name: true } });
  if (!sport) throw new AppError('Sport not found', 404, 'NOT_FOUND');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.sport.update({ where: { id: sportId }, data: { status: 'hidden' } });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'sport_hidden', targetType: 'sport', targetId: sportId,
        previousValue: { status: sport.status },
        newValue:      { status: 'hidden' },
        internalNote,
      },
    });
    return result;
  });

  return updated;
}

async function createSubCategory(sportId, adminId, { name, recommendedParcelSize, isOversized = false, displayOrder = 0 } = {}) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId }, select: { id: true } });
  if (!sport) throw new AppError('Sport not found', 404, 'NOT_FOUND');

  const slug = slugify(name);

  const subCat = await prisma.$transaction(async (tx) => {
    const result = await tx.subCategory.create({
      data: { sportId, name, slug, recommendedParcelSize, isOversized, displayOrder },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'category_added', targetType: 'sub_category', targetId: result.id,
        newValue: { sportId, name, slug, recommendedParcelSize },
      },
    });
    return result;
  });

  return subCat;
}

// ─── BADGES ───────────────────────────────────────────────────────────────────

async function getBadgeQueue({ page = 1, pageSize = 20 } = {}) {
  // Sellers eligible for badge review (unverified, >=5 sales) plus already-verified
  // sellers, so the same screen can both approve new badges and revoke existing ones.
  const where = {
    role: { in: ['seller', 'both'] },
    accountStatus: 'active',
    OR: [
      { verifiedSeller: false, totalSales: { gte: 5 } },
      { verifiedSeller: true },
    ],
  };
  const skip  = (page - 1) * pageSize;

  const [rows, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ verifiedSeller: 'asc' }, { totalSales: 'desc' }],
      skip,
      take: pageSize,
      select: {
        id: true, displayName: true, username: true, avatarUrl: true, email: true,
        accountStatus: true, verifiedSeller: true,
        totalSales: true, averageRating: true, reviewCount: true, createdAt: true,
        sellerBadgesSeller: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { action: true, reason: true, reapplicationEligibleAt: true, createdAt: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Only completedSales/avgRating are tracked on the User record today — the
  // remaining eligibility checks (90-day rating, dispute rate, dispatch time)
  // need cross-table aggregation not yet implemented, so they're left unset
  // and render as unmet rather than falsely passing.
  const users = rows.map((u) => ({
    ...u,
    isVerified: u.verifiedSeller,
    badgeMetrics: { completedSales: u.totalSales, avgRating: u.averageRating },
  }));

  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

async function approveBadge(sellerId, adminId, { internalNote } = {}) {
  const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { id: true, verifiedSeller: true, role: true } });
  if (!seller) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (!['seller', 'both'].includes(seller.role)) throw new AppError('User is not a seller', 400, 'INVALID_ROLE');
  if (seller.verifiedSeller) throw new AppError('Seller is already verified', 409, 'ALREADY_VERIFIED');

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: sellerId }, data: { verifiedSeller: true } });
    await tx.sellerBadge.create({
      data: { sellerId, adminId, action: 'granted', reason: internalNote },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'badge_granted', targetType: 'user', targetId: sellerId,
        newValue: { verifiedSeller: true },
        internalNote,
      },
    });
  });

  notify(sellerId, 'badge_granted', 'Verified Seller badge granted',
    'Congratulations! You are now a Verified Seller on The Kit Loop.', sellerId, 'user').catch(() => {});
}

async function rejectBadge(sellerId, adminId, { reason, unmetCriteria, reapplicationDays = 30 } = {}) {
  const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { id: true, role: true } });
  if (!seller) throw new AppError('User not found', 404, 'NOT_FOUND');

  const reapplicationEligibleAt = new Date(Date.now() + Number(reapplicationDays) * 24 * 60 * 60 * 1000);

  await prisma.$transaction(async (tx) => {
    await tx.sellerBadge.create({
      data: { sellerId, adminId, action: 'rejected', reason, unmetCriteria, reapplicationEligibleAt },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'badge_revoked', targetType: 'user', targetId: sellerId,
        newValue: { action: 'rejected', reason, unmetCriteria },
      },
    });
  });

  notify(sellerId, 'badge_revoked', 'Verified Seller application not approved',
    `Your Verified Seller application was not approved. ${reason ? `Reason: ${reason}` : ''}`, sellerId, 'user').catch(() => {});
}

async function revokeBadge(sellerId, adminId, { reason, internalNote } = {}) {
  const seller = await prisma.user.findUnique({ where: { id: sellerId }, select: { id: true, verifiedSeller: true } });
  if (!seller) throw new AppError('User not found', 404, 'NOT_FOUND');
  if (!seller.verifiedSeller) throw new AppError('Seller does not have a badge to revoke', 409, 'NOT_VERIFIED');

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: sellerId }, data: { verifiedSeller: false } });
    await tx.sellerBadge.create({
      data: { sellerId, adminId, action: 'revoked', reason },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'badge_revoked', targetType: 'user', targetId: sellerId,
        previousValue: { verifiedSeller: true },
        newValue:      { verifiedSeller: false, reason },
        reason, internalNote,
      },
    });
  });

  notify(sellerId, 'badge_revoked', 'Verified Seller badge revoked',
    `Your Verified Seller badge has been revoked. ${reason ? `Reason: ${reason}` : ''}`, sellerId, 'user').catch(() => {});
}

// ─── FINANCIALS ───────────────────────────────────────────────────────────────

async function listFeeConfigs() {
  return prisma.feeConfig.findMany({
    orderBy: { configKey: 'asc' },
    include: {
      sport: { select: { id: true, name: true } },
      updatedByUser: { select: { username: true } },
    },
  });
}

const FEE_CONFIG_MAX = {
  buyer_protection:    20,
  platform_commission: 30,
};

async function updateFeeConfig(configId, adminId, { configValue, internalNote } = {}) {
  const config = await prisma.feeConfig.findUnique({ where: { id: configId } });
  if (!config) throw new AppError('Fee config not found', 404, 'NOT_FOUND');

  const max = FEE_CONFIG_MAX[config.configKey];
  if (max !== undefined && Number(configValue) > max) {
    throw new AppError(`${config.configKey.replace(/_/g, ' ')} cannot exceed ${max}%`, 400, 'VALIDATION_ERROR');
  }
  if (config.configType === 'flat_amount' && Number(configValue) <= 0) {
    throw new AppError('Shipping fee must be greater than £0.00', 400, 'VALIDATION_ERROR');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.feeConfig.update({
      where: { id: configId },
      data:  { configValue, previousValue: config.configValue, updatedBy: adminId },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'fee_updated', targetType: 'fee_config', targetId: configId,
        previousValue: { configValue: config.configValue },
        newValue:      { configValue },
        internalNote,
      },
    });
    return result;
  });

  return updated;
}

// ─── SITE SETTINGS ─────────────────────────────────────────────────────────

const SITE_SETTING_KEYS = ['homepage_hero_image_url'];

async function getSiteSettings() {
  const rows = await prisma.siteSetting.findMany({ where: { settingKey: { in: SITE_SETTING_KEYS } } });
  const map = {};
  for (const key of SITE_SETTING_KEYS) map[key] = null;
  for (const row of rows) map[row.settingKey] = row.settingValue;
  return map;
}

async function updateSiteSetting(key, adminId, { value, internalNote } = {}) {
  if (!SITE_SETTING_KEYS.includes(key)) throw new AppError('Unknown setting', 400, 'INVALID_SETTING');

  const existing = await prisma.siteSetting.findUnique({ where: { settingKey: key } });

  return prisma.$transaction(async (tx) => {
    const result = await tx.siteSetting.upsert({
      where: { settingKey: key },
      create: { settingKey: key, settingValue: value, updatedBy: adminId },
      update: { settingValue: value, updatedBy: adminId },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'site_setting_updated', targetType: 'site_setting', targetId: result.id,
        previousValue: { value: existing?.settingValue ?? null },
        newValue:      { value },
        internalNote,
      },
    });
    return result;
  });
}

module.exports = {
  // Listings
  listListings, getListingDetail, flagListing, removeListing, restoreListing,
  getFeaturedListingsAdmin, setListingFeatured,
  // Users
  listUsers, getUserDetail, suspendUser, banUser, reinstateUser, hardDeleteUser,
  // Orders
  listOrders, listFlaggedOrders,
  // Disputes
  listDisputes, getDisputeDetail, ruleDispute, requestEvidence,
  // Categories
  listAdminSports, createSport, updateSport, hideSport, unhideSport, createSubCategory,
  // Badges
  getBadgeQueue, approveBadge, rejectBadge, revokeBadge,
  // Financials
  listFeeConfigs, updateFeeConfig,
  // Site settings
  getSiteSettings, updateSiteSetting,
};
