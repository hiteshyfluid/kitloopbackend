const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const checkoutService = require('../services/checkoutService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const initiateSchema = z.object({
  listing_id:       z.string().uuid('Invalid listing ID'),
  counter_offer_id: z.string().uuid().optional(),
});

const addressSchema = z.object({
  line1:    z.string().trim().min(1, 'Address line 1 is required').max(100),
  line2:    z.string().trim().max(100).optional(),
  city:     z.string().trim().min(1, 'City is required').max(60),
  postcode: z.string().trim().min(1, 'Postcode is required').max(10),
});

const confirmSchema = z.object({
  payment_intent_id: z.string().min(1, 'payment_intent_id is required'),
});

// POST /api/checkout/initiate
const initiateCheckout = catchAsync(async (req, res) => {
  const { listing_id, counter_offer_id } = validate(initiateSchema, req.body);
  const session = await checkoutService.initiateCheckout(
    listing_id,
    req.user.id,
    counter_offer_id || null
  );
  sendSuccess(res, 201, { session });
});

// POST /api/checkout/cart/initiate — one session for every available cart item
const initiateCartCheckout = catchAsync(async (req, res) => {
  const session = await checkoutService.initiateCartCheckout(req.user.id);
  sendSuccess(res, 201, { session });
});

// GET /api/checkout/:session_id
const getCheckoutSession = catchAsync(async (req, res) => {
  const session = checkoutService.getCheckoutSession(req.params.session_id, req.user.id);
  sendSuccess(res, 200, { session });
});

// POST /api/checkout/:session_id/address
const submitAddress = catchAsync(async (req, res) => {
  const address = validate(addressSchema, req.body);
  const session = await checkoutService.submitAddress(
    req.params.session_id,
    req.user.id,
    address
  );
  sendSuccess(res, 200, { session });
});

// POST /api/checkout/:session_id/payment-intent
const createPaymentIntent = catchAsync(async (req, res) => {
  const result = await checkoutService.createPaymentIntent(
    req.params.session_id,
    req.user.id
  );
  sendSuccess(res, 200, result);
});

// POST /api/checkout/:session_id/confirm
const confirmOrder = catchAsync(async (req, res) => {
  const { payment_intent_id } = validate(confirmSchema, req.body);
  const result = await checkoutService.confirmOrder(
    req.params.session_id,
    req.user.id,
    payment_intent_id
  );
  // Cart checkouts create several orders; `order` stays the first for older clients
  if (result?.orders) sendSuccess(res, 201, { orders: result.orders, order: result.orders[0] });
  else sendSuccess(res, 201, { order: result });
});

module.exports = {
  initiateCartCheckout,
  initiateCheckout,
  getCheckoutSession,
  submitAddress,
  createPaymentIntent,
  confirmOrder,
};
