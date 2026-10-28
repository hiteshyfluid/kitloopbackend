'use strict';

const { z } = require('zod');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const { sendSuccess } = require('../utils/response');
const settings = require('../services/integrationSettingsService');
const prisma = require('../lib/prisma');
const { getFeeValue } = require('../services/checkoutService');
const { testStripe, testMoov } = require('../services/integrationTestService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const environmentSchema = z.object({ environment: z.enum(['test', 'live']) });
const optionalEnvironmentSchema = z.object({ environment: z.enum(['test', 'live']).optional() });

// ─── GET /api/admin/settings/integrations ────────────────────────────────────
const list = catchAsync(async (req, res) => {
  sendSuccess(res, 200, await settings.listForAdmin());
});

// ─── PUT /api/admin/settings/integrations/:provider ──────────────────────────
// Empty or masked secret fields keep the stored value; null clears it.
const update = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const body = provider === 'general' ? { environment: 'shared', ...req.body } : req.body;
  const result = await settings.updateProvider(provider, body, req.user.id);
  sendSuccess(res, 200, result);
});

// ─── PUT /api/admin/settings/integrations/:provider/mode ─────────────────────
const setMode = catchAsync(async (req, res) => {
  const { environment } = validate(environmentSchema, req.body);
  const result = await settings.setActiveEnvironment(req.params.provider, environment, req.user.id);
  sendSuccess(res, 200, result);
});

// ─── POST /api/admin/settings/integrations/:provider/test ────────────────────
// Tests the saved settings for `environment` (defaults to the active one).
const TESTERS = { stripe: testStripe, moov: testMoov };

const testConnection = catchAsync(async (req, res) => {
  const { provider } = req.params;
  const tester = TESTERS[provider];
  if (!tester) throw new AppError('Unknown integration provider', 404, 'NOT_FOUND');

  let { environment } = validate(optionalEnvironmentSchema, req.body ?? {});
  if (!environment) environment = (await settings.getActive(provider))?.environment;

  const saved = environment && await settings.getForEnvironment(provider, environment);
  if (!saved) {
    throw new AppError('Save settings for this environment before testing', 400, 'INTEGRATION_INCOMPLETE');
  }

  const result = await tester(saved);
  await settings.recordConnectionTest(provider, environment, saved.id, req.user.id, result.ok);
  sendSuccess(res, 200, { environment, testedAt: new Date(), ...result });
});

// ─── GET /api/config/public ──────────────────────────────────────────────────
// Public, non-secret configuration for the frontend. The Stripe publishable key
// is the only credential ever exposed.
const BRANDING_KEYS = ['site_logo_url', 'site_logo_footer_url'];

const publicConfig = catchAsync(async (req, res) => {
  const [stripe, moov, brandingRows, buyerProtectionPct] = await Promise.all([
    settings.getActive('stripe'),
    settings.getActive('moov'),
    prisma.siteSetting.findMany({ where: { settingKey: { in: BRANDING_KEYS } } }),
    getFeeValue('buyer_protection_fee_percentage'),
  ]);
  const branding = Object.fromEntries(brandingRows.map((r) => [r.settingKey, r.settingValue]));
  res.set('Cache-Control', 'public, max-age=60');
  sendSuccess(res, 200, {
    stripe: stripe?.config.publishable_key
      ? { publishableKey: stripe.config.publishable_key, mode: stripe.environment }
      : null,
    shipping: { enabledCouriers: moov?.config.enabled_couriers ?? [] },
    // Same value checkout charges, so listing pages can show the buyer's real total
    fees: { buyerProtectionPct },
    // Logos set in Admin → Branding; null means "use the built-in wordmark"
    branding: {
      logoUrl: branding.site_logo_url ?? null,
      logoFooterUrl: branding.site_logo_footer_url ?? null,
    },
  });
});

module.exports = { list, update, setMode, testConnection, publicConfig };
