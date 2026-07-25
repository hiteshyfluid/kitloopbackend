const { z } = require('zod');
const AppError   = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const userService    = require('../services/userService');
const reviewService  = require('../services/reviewService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const updateProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(60).optional(),
  username:     z.string().trim().min(3).max(30).regex(/^[a-z0-9_.-]+$/i, 'Username may only contain letters, numbers, underscores, hyphens and dots').optional(),
  avatar_url:   z.string().url().optional(),
});

const notifSchema = z.object({
  notification_order_updates: z.boolean().optional(),
  notification_messages:      z.boolean().optional(),
  notification_price_drops:   z.boolean().optional(),
  notification_promotions:    z.boolean().optional(),
  notification_disputes:      z.boolean().optional(),
});

const privacySchema = z.object({
  privacy_profile_public: z.boolean().optional(),
  privacy_data_sharing:   z.boolean().optional(),
});

const postageSchema = z.object({
  default_parcel_size: z.enum(['small', 'medium', 'large', 'oversized']).nullable(),
});

const holidaySchema = z.object({
  enabled: z.boolean(),
});

const paginationSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(20),
});

const deleteSchema = z.object({
  confirm: z.literal('DELETE', { errorMap: () => ({ message: 'Type DELETE to confirm' }) }),
});

// GET /api/users/profile
const getOwnProfile = catchAsync(async (req, res) => {
  const user = await userService.getOwnProfile(req.user.id);
  sendSuccess(res, 200, { user });
});

// PUT /api/users/profile
const updateProfile = catchAsync(async (req, res) => {
  const { display_name, username, avatar_url } = validate(updateProfileSchema, req.body);
  const user = await userService.updateProfile(req.user.id, {
    displayName: display_name,
    username,
    avatarUrl: avatar_url,
  });
  sendSuccess(res, 200, { user });
});

// GET /api/users/:id/profile
const getPublicProfile = catchAsync(async (req, res) => {
  const user = await userService.getPublicProfile(req.params.id);
  sendSuccess(res, 200, { user });
});

// GET /api/users/:id/reviews
const getSellerReviews = catchAsync(async (req, res) => {
  const { page, page_size } = validate(paginationSchema, req.query);
  const result = await reviewService.getSellerReviews(req.params.id, { page, pageSize: page_size });
  sendSuccess(res, 200, result);
});

// PUT /api/users/settings/notifications
const updateNotificationSettings = catchAsync(async (req, res) => {
  const raw = validate(notifSchema, req.body);
  // Map snake_case to camelCase for the service
  const prefs = {
    notificationOrderUpdates: raw.notification_order_updates,
    notificationMessages:     raw.notification_messages,
    notificationPriceDrops:   raw.notification_price_drops,
    notificationPromotions:   raw.notification_promotions,
    notificationDisputes:     raw.notification_disputes,
  };
  const user = await userService.updateNotificationSettings(req.user.id, prefs);
  sendSuccess(res, 200, { user });
});

// PUT /api/users/settings/privacy
const updatePrivacySettings = catchAsync(async (req, res) => {
  const raw = validate(privacySchema, req.body);
  const prefs = {
    privacyProfilePublic: raw.privacy_profile_public,
    privacyDataSharing:   raw.privacy_data_sharing,
  };
  const user = await userService.updatePrivacySettings(req.user.id, prefs);
  sendSuccess(res, 200, { user });
});

// PUT /api/users/settings/postage
const updatePostageSettings = catchAsync(async (req, res) => {
  const { default_parcel_size } = validate(postageSchema, req.body);
  const user = await userService.updatePostagePreference(req.user.id, default_parcel_size);
  sendSuccess(res, 200, { user });
});

// PUT /api/users/holiday-mode
const toggleHolidayMode = catchAsync(async (req, res) => {
  const { enabled } = validate(holidaySchema, req.body);
  const result = await userService.toggleHolidayMode(req.user.id, enabled);
  sendSuccess(res, 200, result);
});

// GET /api/users/balance
const getBalance = catchAsync(async (req, res) => {
  const balance = await userService.getBalance(req.user.id);
  sendSuccess(res, 200, { balance });
});

// DELETE /api/users/account
const requestAccountDeletion = catchAsync(async (req, res) => {
  validate(deleteSchema, req.body);
  await userService.requestAccountDeletion(req.user.id);
  sendSuccess(res, 200, { message: 'Account deletion requested' });
});

module.exports = {
  getOwnProfile,
  updateProfile,
  getPublicProfile,
  getSellerReviews,
  updateNotificationSettings,
  updatePrivacySettings,
  updatePostageSettings,
  toggleHolidayMode,
  getBalance,
  requestAccountDeletion,
};
