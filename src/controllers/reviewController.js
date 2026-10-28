const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const reviewService = require('../services/reviewService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const submitReviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  body:   z.string().trim().max(500).optional(),
});

const paginationSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
});

// POST /api/orders/:id/review
const submitReview = catchAsync(async (req, res) => {
  const { rating, body } = validate(submitReviewSchema, req.body);
  const review = await reviewService.submitReview(req.params.id, req.user.id, { rating, body });
  sendSuccess(res, 201, { review });
});

// GET /api/sellers/:id/reviews
const getSellerReviews = catchAsync(async (req, res) => {
  const { page, page_size } = validate(paginationSchema, req.query);
  const result = await reviewService.getSellerReviews(req.params.id, { page, pageSize: page_size });
  sendSuccess(res, 200, result);
});

module.exports = { submitReview, getSellerReviews };
