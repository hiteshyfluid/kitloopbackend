const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const orderService = require('../services/orderService');
const shippingService = require('../services/shippingService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const paginationSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
});

const dispatchSchema = z.object({
  tracking_number: z.string().trim().max(100).optional(),
});

// GET /api/orders/purchases
const getMyPurchases = catchAsync(async (req, res) => {
  const { page, page_size } = validate(paginationSchema, req.query);
  const result = await orderService.getMyPurchases(req.user.id, { page, pageSize: page_size });
  sendSuccess(res, 200, result);
});

// GET /api/orders/sales
const getMySales = catchAsync(async (req, res) => {
  const { page, page_size } = validate(paginationSchema, req.query);
  const result = await orderService.getMySales(req.user.id, { page, pageSize: page_size });
  sendSuccess(res, 200, result);
});

// GET /api/orders/:id
const getOrder = catchAsync(async (req, res) => {
  const order = await orderService.getOrder(req.params.id, req.user.id);
  sendSuccess(res, 200, { order });
});

// POST /api/orders/:id/dispatch
const dispatchOrder = catchAsync(async (req, res) => {
  const { tracking_number } = validate(dispatchSchema, req.body);
  const order = await orderService.dispatchOrder(req.params.id, req.user.id, tracking_number);
  sendSuccess(res, 200, { order });
});

// POST /api/orders/:id/confirm-delivery
const confirmDelivery = catchAsync(async (req, res) => {
  const order = await orderService.confirmDelivery(req.params.id, req.user.id);
  sendSuccess(res, 200, { order });
});

// ─── Shipping labels (seller) ────────────────────────────────────────────────

const orderIdSchema = z.object({ id: z.string().uuid('Order not found') });

// POST /api/orders/:id/label — buy the DPD label through Moov. The seller drops
// the parcel at a DPD Pickup shop (QR code or printed label)
const createLabel = catchAsync(async (req, res) => {
  const { id } = validate(orderIdSchema, req.params);
  await shippingService.createLabel(id, req.user.id);
  const order = await orderService.getOrder(id, req.user.id);
  sendSuccess(res, 201, { order });
});

// GET /api/orders/:id/label — the label file (contains the buyer's address)
// GET /api/orders/:id/label/qr — the drop-off QR code, when DPD returned one
const getLabel = catchAsync(async (req, res) => {
  const { id } = validate(orderIdSchema, req.params);
  const kind = req.path.endsWith('/qr') ? 'qr' : 'label';
  const { buffer, mime } = await shippingService.getLabel(id, req.user.id, kind);
  res.set({ 'Content-Type': mime, 'Cache-Control': 'private, no-store' });
  res.send(buffer);
});

module.exports = {
  getMyPurchases,
  getMySales,
  getOrder,
  dispatchOrder,
  confirmDelivery,
  createLabel,
  getLabel,
};
