'use strict';

const { z } = require('zod');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const svc = require('../services/adminService');

// ─── Shared helpers ──────────────────────────────────────────────────────────

function pagination(query) {
  return {
    page:     Math.max(1, parseInt(query.page, 10)      || 1),
    pageSize: Math.min(100, parseInt(query.page_size, 10) || 20),
  };
}

const AppError = require('../utils/AppError');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

// ─── LISTINGS ────────────────────────────────────────────────────────────────

const listListings = catchAsync(async (req, res) => {
  const { status, search } = req.query;
  const { page, pageSize } = pagination(req.query);
  const result = await svc.listListings({ status, search, page, pageSize });
  sendSuccess(res, 200, result);
});

const getListingDetail = catchAsync(async (req, res) => {
  const listing = await svc.getListingDetail(req.params.id);
  sendSuccess(res, 200, { listing });
});

const flagListingSchema = z.object({
  reason:       z.string().trim().min(5).max(500),
  internal_note: z.string().trim().max(1000).optional(),
});
const flagListing = catchAsync(async (req, res) => {
  const { reason, internal_note } = validate(flagListingSchema, req.body);
  const listing = await svc.flagListing(req.params.id, req.user.id, { reason, internalNote: internal_note });
  sendSuccess(res, 200, { listing });
});

const removeListingSchema = z.object({
  reason:       z.string().trim().min(5).max(500),
  internal_note: z.string().trim().max(1000).optional(),
});
const removeListing = catchAsync(async (req, res) => {
  const { reason, internal_note } = validate(removeListingSchema, req.body);
  const listing = await svc.removeListing(req.params.id, req.user.id, { reason, internalNote: internal_note });
  sendSuccess(res, 200, { listing });
});

const restoreListingSchema = z.object({
  internal_note: z.string().trim().max(1000).optional(),
});
const restoreListing = catchAsync(async (req, res) => {
  const { internal_note } = validate(restoreListingSchema, req.body);
  const listing = await svc.restoreListing(req.params.id, req.user.id, { internalNote: internal_note });
  sendSuccess(res, 200, { listing });
});

const getFeaturedListings = catchAsync(async (req, res) => {
  const { search } = req.query;
  const result = await svc.getFeaturedListingsAdmin({ search });
  sendSuccess(res, 200, result);
});

const setListingFeaturedSchema = z.object({
  featured:      z.coerce.boolean(),
  internal_note: z.string().trim().max(1000).optional(),
});
const setListingFeatured = catchAsync(async (req, res) => {
  const { featured, internal_note } = validate(setListingFeaturedSchema, req.body);
  const listing = await svc.setListingFeatured(req.params.id, req.user.id, featured, { internalNote: internal_note });
  sendSuccess(res, 200, { listing });
});

// ─── USERS ───────────────────────────────────────────────────────────────────

const listUsers = catchAsync(async (req, res) => {
  const { search, role, status } = req.query;
  const { page, pageSize } = pagination(req.query);
  const result = await svc.listUsers({ search, role, status, page, pageSize });
  sendSuccess(res, 200, result);
});

const getUserDetail = catchAsync(async (req, res) => {
  const user = await svc.getUserDetail(req.params.id);
  sendSuccess(res, 200, { user });
});

const suspendUserSchema = z.object({
  reason:        z.string().trim().min(5).max(500),
  duration_days: z.coerce.number().int().min(1).max(365).optional(),
  internal_note: z.string().trim().max(1000).optional(),
});
const suspendUser = catchAsync(async (req, res) => {
  const { reason, duration_days, internal_note } = validate(suspendUserSchema, req.body);
  const user = await svc.suspendUser(req.params.id, req.user.id, { reason, durationDays: duration_days, internalNote: internal_note });
  sendSuccess(res, 200, { user });
});

const banUserSchema = z.object({
  reason:        z.string().trim().min(5).max(500),
  internal_note: z.string().trim().max(1000).optional(),
});
const banUser = catchAsync(async (req, res) => {
  const { reason, internal_note } = validate(banUserSchema, req.body);
  const user = await svc.banUser(req.params.id, req.user.id, { reason, internalNote: internal_note });
  sendSuccess(res, 200, { user });
});

const reinstateUserSchema = z.object({
  internal_note: z.string().trim().max(1000).optional(),
});
const reinstateUser = catchAsync(async (req, res) => {
  const { internal_note } = validate(reinstateUserSchema, req.body);
  const user = await svc.reinstateUser(req.params.id, req.user.id, { internalNote: internal_note });
  sendSuccess(res, 200, { user });
});

const hardDeleteUserSchema = z.object({
  confirm:       z.literal('DELETE'),
  internal_note: z.string().trim().max(1000).optional(),
});
const hardDeleteUser = catchAsync(async (req, res) => {
  const { internal_note } = validate(hardDeleteUserSchema, req.body);
  await svc.hardDeleteUser(req.params.id, req.user.id, { internalNote: internal_note });
  sendSuccess(res, 200, { message: 'User account deleted' });
});

// ─── ORDERS ──────────────────────────────────────────────────────────────────

const listOrders = catchAsync(async (req, res) => {
  const { status } = req.query;
  const { page, pageSize } = pagination(req.query);
  const result = await svc.listOrders({ status, page, pageSize });
  sendSuccess(res, 200, result);
});

const listFlaggedOrders = catchAsync(async (req, res) => {
  const { page, pageSize } = pagination(req.query);
  const result = await svc.listFlaggedOrders({ page, pageSize });
  sendSuccess(res, 200, result);
});

// ─── DISPUTES ────────────────────────────────────────────────────────────────

const listDisputes = catchAsync(async (req, res) => {
  const { status } = req.query;
  const { page, pageSize } = pagination(req.query);
  const result = await svc.listDisputes({ status, page, pageSize });
  sendSuccess(res, 200, result);
});

const getDisputeDetail = catchAsync(async (req, res) => {
  const dispute = await svc.getDisputeDetail(req.params.id);
  sendSuccess(res, 200, { dispute });
});

const ruleDisputeSchema = z.object({
  ruling:                z.enum(['refund_buyer', 'release_seller', 'partial_resolution']),
  ruling_reason:         z.string().trim().min(10).max(1000),
  refund_amount:         z.coerce.number().positive().optional(),
  seller_release_amount: z.coerce.number().positive().optional(),
  shipping_fee_refunded: z.coerce.boolean().default(false),
});
const ruleDispute = catchAsync(async (req, res) => {
  const { ruling, ruling_reason, refund_amount, seller_release_amount, shipping_fee_refunded } =
    validate(ruleDisputeSchema, req.body);
  await svc.ruleDispute(req.params.id, req.user.id, {
    ruling,
    rulingReason:        ruling_reason,
    refundAmount:        refund_amount,
    sellerReleaseAmount: seller_release_amount,
    shippingFeeRefunded: shipping_fee_refunded,
  });
  sendSuccess(res, 200, { message: 'Dispute ruled successfully' });
});

const requestEvidenceSchema = z.object({
  deadline:      z.string().datetime().optional(),
  internal_note: z.string().trim().max(1000).optional(),
});
const requestEvidence = catchAsync(async (req, res) => {
  const { deadline, internal_note } = validate(requestEvidenceSchema, req.body);
  await svc.requestEvidence(req.params.id, req.user.id, { deadline, internalNote: internal_note });
  sendSuccess(res, 200, { message: 'Evidence request sent' });
});

// ─── CATEGORIES ──────────────────────────────────────────────────────────────

const listSports = catchAsync(async (req, res) => {
  const sports = await svc.listAdminSports();
  sendSuccess(res, 200, { sports });
});

const unhideSport = catchAsync(async (req, res) => {
  const sport = await svc.unhideSport(req.params.id, req.user.id);
  sendSuccess(res, 200, { sport });
});

const createSportSchema = z.object({
  name:                    z.string().trim().min(2).max(50),
  icon_url:                z.string().url(),
  sport_tag:               z.enum(['bat_ball', 'racket', 'team', 'endurance', 'snow', 'water', 'combat', 'precision']),
  display_order:           z.coerce.number().int().min(0).default(0),
  seasonal_highlight:      z.coerce.boolean().default(false),
  seasonal_highlight_start: z.string().datetime().optional(),
  seasonal_highlight_end:   z.string().datetime().optional(),
});
const createSport = catchAsync(async (req, res) => {
  const { name, icon_url, sport_tag, display_order, seasonal_highlight, seasonal_highlight_start, seasonal_highlight_end } =
    validate(createSportSchema, req.body);
  const sport = await svc.createSport(req.user.id, {
    name, iconUrl: icon_url, sportTag: sport_tag, displayOrder: display_order,
    seasonalHighlight: seasonal_highlight,
    seasonalHighlightStart: seasonal_highlight_start,
    seasonalHighlightEnd:   seasonal_highlight_end,
  });
  sendSuccess(res, 201, { sport });
});

const updateSportSchema = z.object({
  name:                    z.string().trim().min(2).max(50).optional(),
  icon_url:                z.string().url().optional(),
  sport_tag:               z.enum(['bat_ball', 'racket', 'team', 'endurance', 'snow', 'water', 'combat', 'precision']).optional(),
  display_order:           z.coerce.number().int().min(0).optional(),
  status:                  z.enum(['active', 'hidden']).optional(),
  seasonal_highlight:      z.coerce.boolean().optional(),
  seasonal_highlight_start: z.string().datetime().optional(),
  seasonal_highlight_end:   z.string().datetime().optional(),
});
const updateSport = catchAsync(async (req, res) => {
  const parsed = validate(updateSportSchema, req.body);
  const sport = await svc.updateSport(req.params.id, req.user.id, {
    name:                   parsed.name,
    iconUrl:                parsed.icon_url,
    sportTag:               parsed.sport_tag,
    displayOrder:           parsed.display_order,
    status:                 parsed.status,
    seasonalHighlight:      parsed.seasonal_highlight,
    seasonalHighlightStart: parsed.seasonal_highlight_start,
    seasonalHighlightEnd:   parsed.seasonal_highlight_end,
  });
  sendSuccess(res, 200, { sport });
});

const hideSportSchema = z.object({
  internal_note: z.string().trim().max(1000).optional(),
});
const hideSport = catchAsync(async (req, res) => {
  const { internal_note } = validate(hideSportSchema, req.body);
  const sport = await svc.hideSport(req.params.id, req.user.id, { internalNote: internal_note });
  sendSuccess(res, 200, { sport });
});

const createSubCategorySchema = z.object({
  name:                    z.string().trim().min(2).max(60),
  recommended_parcel_size: z.enum(['small', 'medium', 'large', 'oversized']),
  is_oversized:            z.coerce.boolean().default(false),
  display_order:           z.coerce.number().int().min(0).default(0),
});
const createSubCategory = catchAsync(async (req, res) => {
  const { name, recommended_parcel_size, is_oversized, display_order } =
    validate(createSubCategorySchema, req.body);
  const subCategory = await svc.createSubCategory(req.params.sportId, req.user.id, {
    name, recommendedParcelSize: recommended_parcel_size, isOversized: is_oversized, displayOrder: display_order,
  });
  sendSuccess(res, 201, { sub_category: subCategory });
});

// ─── BADGES ──────────────────────────────────────────────────────────────────

const getBadgeQueue = catchAsync(async (req, res) => {
  const { page, pageSize } = pagination(req.query);
  const { users, ...rest } = await svc.getBadgeQueue({ page, pageSize });
  sendSuccess(res, 200, { queue: users, ...rest });
});

const approveBadgeSchema = z.object({
  internal_note: z.string().trim().max(1000).optional(),
});
const approveBadge = catchAsync(async (req, res) => {
  const { internal_note } = validate(approveBadgeSchema, req.body);
  await svc.approveBadge(req.params.userId, req.user.id, { internalNote: internal_note });
  sendSuccess(res, 200, { message: 'Badge approved' });
});

const rejectBadgeSchema = z.object({
  reason:              z.string().trim().min(5).max(500).optional(),
  unmet_criteria:      z.array(z.string()).max(10).optional(),
  reapplication_days:  z.coerce.number().int().min(7).max(365).default(30),
});
const rejectBadge = catchAsync(async (req, res) => {
  const { reason, unmet_criteria, reapplication_days } = validate(rejectBadgeSchema, req.body);
  await svc.rejectBadge(req.params.userId, req.user.id, {
    reason, unmetCriteria: unmet_criteria, reapplicationDays: reapplication_days,
  });
  sendSuccess(res, 200, { message: 'Badge application rejected' });
});

const revokeBadgeSchema = z.object({
  reason:        z.string().trim().min(5).max(500),
  internal_note: z.string().trim().max(1000).optional(),
});
const revokeBadge = catchAsync(async (req, res) => {
  const { reason, internal_note } = validate(revokeBadgeSchema, req.body);
  await svc.revokeBadge(req.params.userId, req.user.id, { reason, internalNote: internal_note });
  sendSuccess(res, 200, { message: 'Badge revoked' });
});

// ─── FINANCIALS ──────────────────────────────────────────────────────────────

const listFeeConfigs = catchAsync(async (req, res) => {
  const feeConfigs = await svc.listFeeConfigs();
  sendSuccess(res, 200, { fee_configs: feeConfigs });
});

const updateFeeConfigSchema = z.object({
  config_value:  z.coerce.number().min(0),
  internal_note: z.string().trim().max(1000).optional(),
});
const updateFeeConfig = catchAsync(async (req, res) => {
  const { config_value, internal_note } = validate(updateFeeConfigSchema, req.body);
  const feeConfig = await svc.updateFeeConfig(req.params.id, req.user.id, { configValue: config_value, internalNote: internal_note });
  sendSuccess(res, 200, { fee_config: feeConfig });
});

// ─── SITE SETTINGS ───────────────────────────────────────────────────────────

const getSiteSettings = catchAsync(async (req, res) => {
  const settings = await svc.getSiteSettings();
  sendSuccess(res, 200, { settings });
});

const updateSiteSettingSchema = z.object({
  value:         z.string().trim().url().max(2000).nullable(),
  internal_note: z.string().trim().max(1000).optional(),
});
const updateSiteSetting = catchAsync(async (req, res) => {
  const { value, internal_note } = validate(updateSiteSettingSchema, req.body);
  const setting = await svc.updateSiteSetting(req.params.key, req.user.id, { value, internalNote: internal_note });
  sendSuccess(res, 200, { setting });
});

module.exports = {
  // Listings
  listListings, getListingDetail, flagListing, removeListing, restoreListing,
  getFeaturedListings, setListingFeatured,
  // Users
  listUsers, getUserDetail, suspendUser, banUser, reinstateUser, hardDeleteUser,
  // Orders
  listOrders, listFlaggedOrders,
  // Disputes
  listDisputes, getDisputeDetail, ruleDispute, requestEvidence,
  // Categories
  listSports, unhideSport, createSport, updateSport, hideSport, createSubCategory,
  // Badges
  getBadgeQueue, approveBadge, rejectBadge, revokeBadge,
  // Financials
  listFeeConfigs, updateFeeConfig,
  // Site settings
  getSiteSettings, updateSiteSetting,
};
