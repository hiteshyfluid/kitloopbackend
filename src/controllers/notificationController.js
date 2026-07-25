const { z } = require('zod');
const AppError   = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess }        = require('../utils/response');
const notificationService    = require('../services/notificationService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const querySchema = z.object({
  page:        z.coerce.number().int().min(1).default(1),
  page_size:   z.coerce.number().int().min(1).max(50).default(20),
  unread_only: z.coerce.boolean().default(false),
});

// GET /api/notifications
const getNotifications = catchAsync(async (req, res) => {
  const { page, page_size, unread_only } = validate(querySchema, req.query);
  const result = await notificationService.getNotifications(req.user.id, {
    page,
    pageSize: page_size,
    unreadOnly: unread_only,
  });
  sendSuccess(res, 200, result);
});

// PATCH /api/notifications/:id/read
const markRead = catchAsync(async (req, res) => {
  const n = await notificationService.markRead(req.params.id, req.user.id);
  sendSuccess(res, 200, { notification: n });
});

// PATCH /api/notifications/read-all
const markAllRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllRead(req.user.id);
  sendSuccess(res, 200, result);
});

module.exports = { getNotifications, markRead, markAllRead };
