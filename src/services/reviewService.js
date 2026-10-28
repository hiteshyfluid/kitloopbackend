const prisma  = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { notify } = require('./notificationService');

const REVIEW_SELECT = {
  id: true,
  orderId: true,
  reviewerId: true,
  sellerId: true,
  rating: true,
  body: true,
  isVisible: true,
  createdAt: true,
  reviewer: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  order:    { select: { snapshotListingTitle: true } },
};

// ─── submitReview ─────────────────────────────────────────────────────────────
async function submitReview(orderId, buyerId, { rating, body }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true, buyerId: true, sellerId: true,
      fulfilmentStatus: true, snapshotListingTitle: true,
      review: { select: { id: true } },
    },
  });

  if (!order) throw new AppError('Order not found', 404, 'NOT_FOUND');
  if (order.buyerId !== buyerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (order.fulfilmentStatus !== 'completed') {
    throw new AppError('Reviews can only be left after order completion', 409, 'INVALID_STATUS');
  }
  if (order.review) {
    throw new AppError('You have already reviewed this order', 409, 'ALREADY_REVIEWED');
  }

  const ratingInt = Math.round(Number(rating));
  if (!Number.isInteger(ratingInt) || ratingInt < 1 || ratingInt > 5) {
    throw new AppError('Rating must be between 1 and 5', 400, 'VALIDATION_ERROR');
  }

  // Create review then recalculate seller aggregate in same tx
  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        orderId,
        reviewerId: buyerId,
        sellerId:   order.sellerId,
        rating:     ratingInt,
        body:       body?.trim() || null,
      },
      select: REVIEW_SELECT,
    });

    const stats = await tx.review.aggregate({
      where: { sellerId: order.sellerId, isVisible: true, removedByAdmin: false },
      _avg:   { rating: true },
      _count: { id: true },
    });

    await tx.user.update({
      where: { id: order.sellerId },
      data: {
        averageRating: stats._avg.rating ?? ratingInt,
        reviewCount:   stats._count.id,
      },
    });

    return created;
  });

  notify(
    order.sellerId,
    'review_received',
    'You received a new review',
    `A buyer rated your sale of "${order.snapshotListingTitle}" ${ratingInt}/5 stars.`,
    review.id,
    'review'
  ).catch(() => {});

  return review;
}

// ─── getSellerReviews ─────────────────────────────────────────────────────────
async function getSellerReviews(sellerId, { page = 1, pageSize = 20 } = {}) {
  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: {
      id: true, username: true, displayName: true,
      avatarUrl: true, averageRating: true, reviewCount: true,
    },
  });
  if (!seller) throw new AppError('Seller not found', 404, 'NOT_FOUND');

  const where = { sellerId, isVisible: true, removedByAdmin: false };
  const skip  = (page - 1) * pageSize;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      select: REVIEW_SELECT,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ]);

  return {
    seller,
    reviews,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

module.exports = { submitReview, getSellerReviews };
