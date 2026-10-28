const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const cartService = require('../services/cartService');

const addSchema = z.object({ listing_id: z.string().uuid('Invalid listing ID') });
const listingParam = z.string().uuid('Invalid listing ID');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

// GET /api/cart
const getCart = catchAsync(async (req, res) => {
  sendSuccess(res, 200, await cartService.getCart(req.user.id));
});

// POST /api/cart  { listing_id }
const addItem = catchAsync(async (req, res) => {
  const { listing_id } = validate(addSchema, req.body);
  sendSuccess(res, 200, await cartService.addItem(req.user.id, listing_id));
});

// DELETE /api/cart/:listing_id
const removeItem = catchAsync(async (req, res) => {
  const listingId = validate(listingParam, req.params.listing_id);
  sendSuccess(res, 200, await cartService.removeItem(req.user.id, listingId));
});

// DELETE /api/cart
const clearCart = catchAsync(async (req, res) => {
  sendSuccess(res, 200, await cartService.clearCart(req.user.id));
});

module.exports = { getCart, addItem, removeItem, clearCart };
