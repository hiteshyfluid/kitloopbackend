const { z }              = require('zod');
const AppError           = require('../utils/AppError');
const catchAsync         = require('../utils/catchAsync');
const { sendSuccess }    = require('../utils/response');
const messageService     = require('../services/messageService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

// ── Schemas ──────────────────────────────────────────────────────────────────

const getOrCreateSchema = z.object({
  listing_id: z.string().uuid('Invalid listing_id'),
});

const getThreadsSchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  page_size:   z.coerce.number().int().min(1).max(50).default(20),
  unread_only: z.string().optional().transform(v => v === 'true'),
});

const getMessagesSchema = z.object({
  before: z.string().uuid().optional(),
});

const sendMessageSchema = z.object({
  body:         z.string().trim().max(500).optional(),
  offer_amount: z.coerce.number().min(0.01).max(9999).optional(),
}).refine(d => d.body || d.offer_amount, {
  message: 'At least one of body or offer_amount is required',
  path:    ['body'],
});

const sendCounterSchema = z.object({
  counter_amount: z.coerce.number().min(1).max(9999, 'counter_amount must be ≤ £9,999'),
  message:        z.string().trim().max(500).optional(),
});

// ── Handlers ─────────────────────────────────────────────────────────────────

// POST /api/offers
const getOrCreateThread = catchAsync(async (req, res) => {
  const { listing_id } = validate(getOrCreateSchema, req.body);
  const { offer, isNewThread } = await messageService.getOrCreateThread(listing_id, req.user.id);
  sendSuccess(res, isNewThread ? 201 : 200, { isNewThread, offer });
});

// GET /api/offers
const getMyThreads = catchAsync(async (req, res) => {
  const { page, page_size, unread_only } = validate(getThreadsSchema, req.query);
  const result = await messageService.getMyThreads(req.user.id, {
    page,
    pageSize: page_size,
    unreadOnly: unread_only,
  });
  sendSuccess(res, 200, result);
});

// GET /api/offers/:id
const getThreadDetail = catchAsync(async (req, res) => {
  const offer = await messageService.getThreadDetail(req.params.id, req.user.id);
  sendSuccess(res, 200, { offer });
});

// GET /api/offers/:id/messages
const getMessages = catchAsync(async (req, res) => {
  const { before } = validate(getMessagesSchema, req.query);
  const result = await messageService.getMessages(req.params.id, req.user.id, before);
  sendSuccess(res, 200, result);
});

// POST /api/offers/:id/messages  (content scan applied by route middleware)
const sendMessage = catchAsync(async (req, res) => {
  const { body, offer_amount } = validate(sendMessageSchema, req.body);
  const message = await messageService.sendMessage(
    req.params.id,
    req.user.id,
    body,
    offer_amount
  );
  sendSuccess(res, 201, { message });
});

// POST /api/offers/:id/counter-offers  (content scan applied by route middleware)
const sendCounterOffer = catchAsync(async (req, res) => {
  const { counter_amount, message } = validate(sendCounterSchema, req.body);
  const counterOffer = await messageService.sendCounterOffer(
    req.params.id,
    req.user.id,
    counter_amount,
    message
  );
  sendSuccess(res, 201, { counterOffer });
});

// POST /api/counter-offers/:id/accept
const acceptCounterOffer = catchAsync(async (req, res) => {
  const result = await messageService.acceptCounterOffer(req.params.id, req.user.id);
  sendSuccess(res, 200, result);
});

// POST /api/counter-offers/:id/decline
const declineCounterOffer = catchAsync(async (req, res) => {
  const counterOffer = await messageService.declineCounterOffer(req.params.id, req.user.id);
  sendSuccess(res, 200, { counterOffer });
});

module.exports = {
  getOrCreateThread,
  getMyThreads,
  getThreadDetail,
  getMessages,
  sendMessage,
  sendCounterOffer,
  acceptCounterOffer,
  declineCounterOffer,
};
