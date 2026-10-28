'use strict';

// Central store for third-party integration credentials (Stripe, Moov) and
// payout rules. API keys are set by the super admin, not read from .env.
//
// - Secrets are AES-256-GCM encrypted at rest (utils/secretCrypto.js).
// - Admin views only ever contain masked secrets.
// - The active settings per provider are decrypted once and cached in memory;
//   every write clears the cache.
// - JSON keys inside `config` / `secrets` are snake_case, matching the API.

const { z } = require('zod');
const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { encrypt, decrypt, mask, isMasked } = require('../utils/secretCrypto');

const CACHE_TTL_MS = 5 * 60 * 1000;

// Couriers we have Moov accounts for. Evri can be added once its account exists.
const SUPPORTED_COURIERS = ['DPD', 'YodelC2C'];

const httpsUrl = z.string().trim().url().refine((u) => u.startsWith('https://'), 'URL must start with https://');

const PROVIDERS = {
  stripe: {
    environments: ['test', 'live'],
    switchable: true,
    defaults: {
      publishable_key:      '',
      connect_enabled:      true,
      connect_account_type: 'express',
      statement_descriptor: 'THE KIT LOOP',
    },
    configSchema: {
      publishable_key:      z.string().trim().max(255),
      connect_enabled:      z.boolean(),
      connect_account_type: z.enum(['express', 'standard', 'custom']),
      statement_descriptor: z.string().trim().min(5).max(22).regex(/^[^<>\\'"*]*$/, 'Statement descriptor cannot contain < > \\ \' " *'),
    },
    secretFields: ['secret_key', 'webhook_secret'],
    requiredToActivate: ['secret_key'],
    requiredConfigToActivate: ['publishable_key'],
  },
  moov: {
    environments: ['test', 'live'],
    switchable: true,
    defaults: {
      billing_base_url:     'https://production.billingapi.co.uk',
      courier_base_url:     'https://production.courierapi.co.uk',
      client_name:          'Moov Parcel',
      customer_dc_id:       '',
      api_user:             '',
      auth_company:         'Kitloop',
      courier_auth_company: 'C2C',
      enabled_couriers:     ['DPD', 'YodelC2C'],
    },
    configSchema: {
      billing_base_url:     httpsUrl,
      courier_base_url:     httpsUrl,
      client_name:          z.string().trim().max(100),
      customer_dc_id:       z.string().trim().max(100),
      api_user:             z.string().trim().max(100),
      auth_company:         z.string().trim().min(1).max(100),
      courier_auth_company: z.string().trim().min(1).max(100),
      enabled_couriers:     z.array(z.enum(SUPPORTED_COURIERS)).max(SUPPORTED_COURIERS.length),
    },
    secretFields: ['customer_key', 'api_token'],
    requiredToActivate: ['api_token'],
    requiredConfigToActivate: ['api_user'],
  },
  general: {
    environments: ['shared'],
    switchable: false,
    defaults: {
      payout_hold_days: 3,
    },
    configSchema: {
      payout_hold_days: z.number().int().min(0).max(60),
    },
    secretFields: [],
    requiredToActivate: [],
    requiredConfigToActivate: [],
  },
};

const PROVIDER_NAMES = Object.keys(PROVIDERS);

function getProvider(provider) {
  const def = PROVIDERS[provider];
  if (!def) throw new AppError('Unknown integration provider', 404, 'NOT_FOUND');
  return def;
}

// Builds the zod schema for a PUT body. Secrets accept a string (new value),
// '' / masked string (keep existing) or null (clear).
function updateSchema(provider) {
  const def = getProvider(provider);
  const shape = { environment: z.enum(def.environments) };
  for (const [key, schema] of Object.entries(def.configSchema)) shape[key] = schema.optional();
  for (const key of def.secretFields) shape[key] = z.string().trim().max(500).nullable().optional();
  return z.object(shape).strict();
}

// Rejects keys pasted into the wrong slot (e.g. a live key in the test environment).
function validateSecretFormat(provider, environment, field, value) {
  if (provider !== 'stripe') return;
  const env = environment === 'live' ? 'live' : 'test';
  if (field === 'secret_key' && !new RegExp(`^(sk|rk)_${env}_`).test(value)) {
    throw new AppError(`Secret key must start with sk_${env}_ or rk_${env}_ for the ${environment} environment`, 400, 'VALIDATION_ERROR');
  }
  if (field === 'webhook_secret' && !value.startsWith('whsec_')) {
    throw new AppError('Webhook signing secret must start with whsec_', 400, 'VALIDATION_ERROR');
  }
}

function validateConfigFormat(provider, environment, config) {
  if (provider !== 'stripe' || !config.publishable_key) return;
  const env = environment === 'live' ? 'live' : 'test';
  if (!config.publishable_key.startsWith(`pk_${env}_`)) {
    throw new AppError(`Publishable key must start with pk_${env}_ for the ${environment} environment`, 400, 'VALIDATION_ERROR');
  }
}

const aadFor = (provider, environment, field) => `${provider}:${environment}:${field}`;

function decryptSecrets(row) {
  const out = {};
  for (const [field, payload] of Object.entries(row.secrets || {})) {
    try {
      out[field] = decrypt(payload, aadFor(row.provider, row.environment, field));
    } catch {
      // Wrong SETTINGS_ENCRYPTION_KEY or tampered value — treat as unusable.
      out[field] = null;
    }
  }
  return out;
}

const UPDATED_BY_SELECT = { select: { id: true, displayName: true, email: true } };

// ─── Cache ───────────────────────────────────────────────────────────────────

const cache = new Map(); // provider → { value, expiresAt }

function invalidate(provider) {
  if (provider) cache.delete(provider);
  else cache.clear();
}

// Returns the decrypted active settings for a provider, or null if none are set:
// { id, provider, environment, config, secrets }
async function getActive(provider) {
  getProvider(provider);
  const hit = cache.get(provider);
  if (hit && hit.expiresAt > Date.now()) return hit.value;

  const row = await prisma.integrationSetting.findFirst({ where: { provider, isActive: true } });
  const value = row
    ? {
        id:          row.id,
        provider:    row.provider,
        environment: row.environment,
        config:      { ...PROVIDERS[provider].defaults, ...row.config },
        secrets:     decryptSecrets(row),
      }
    : null;

  cache.set(provider, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

// Decrypted settings for a specific environment (used by "Test connection",
// which may test an environment that isn't active yet).
async function getForEnvironment(provider, environment) {
  const def = getProvider(provider);
  if (!def.environments.includes(environment)) throw new AppError('Invalid environment', 400, 'VALIDATION_ERROR');
  const row = await prisma.integrationSetting.findUnique({
    where: { provider_environment: { provider, environment } },
  });
  if (!row) return null;
  return {
    id:          row.id,
    provider:    row.provider,
    environment: row.environment,
    config:      { ...def.defaults, ...row.config },
    secrets:     decryptSecrets(row),
  };
}

async function getPayoutHoldDays() {
  const general = await getActive('general');
  return general?.config.payout_hold_days ?? PROVIDERS.general.defaults.payout_hold_days;
}

// ─── Admin view (masked) ─────────────────────────────────────────────────────

function toView(provider, environment, row) {
  const def = PROVIDERS[provider];
  const plain = row ? decryptSecrets(row) : {};
  const secrets = {};
  for (const field of def.secretFields) {
    const stored = row?.secrets?.[field];
    secrets[field] = {
      isSet:      Boolean(stored),
      masked:     stored ? mask(plain[field]) : null,
      unreadable: Boolean(stored) && plain[field] === null,
    };
  }
  return {
    environment,
    configured: Boolean(row),
    isActive:   row?.isActive ?? false,
    config:     { ...def.defaults, ...(row?.config || {}) },
    secrets,
    updatedAt:  row?.updatedAt ?? null,
    updatedBy:  row?.updatedBy ?? null,
  };
}

async function listForAdmin() {
  const rows = await prisma.integrationSetting.findMany({ include: { updatedBy: UPDATED_BY_SELECT } });
  const result = {};
  for (const provider of PROVIDER_NAMES) {
    const def = PROVIDERS[provider];
    const environments = {};
    for (const env of def.environments) {
      const row = rows.find((r) => r.provider === provider && r.environment === env);
      environments[env] = toView(provider, env, row);
    }
    const active = rows.find((r) => r.provider === provider && r.isActive);
    result[provider] = { activeEnvironment: active?.environment ?? null, environments };
  }
  return { integrations: result, supportedCouriers: SUPPORTED_COURIERS };
}

// ─── Writes ──────────────────────────────────────────────────────────────────

async function updateProvider(provider, body, actorId) {
  const def = getProvider(provider);
  const parsed = updateSchema(provider).safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path?.join('.');
    throw new AppError(field ? `${field}: ${issue.message}` : (issue?.message || 'Invalid request'), 400, 'VALIDATION_ERROR');
  }
  const { environment, ...input } = parsed.data;

  const existing = await prisma.integrationSetting.findUnique({
    where: { provider_environment: { provider, environment } },
  });

  const config  = { ...def.defaults, ...(existing?.config || {}) };
  const secrets = { ...(existing?.secrets || {}) };
  const changed = [];

  for (const key of Object.keys(def.configSchema)) {
    if (input[key] === undefined) continue;
    if (JSON.stringify(config[key]) !== JSON.stringify(input[key])) changed.push(key);
    config[key] = input[key];
  }
  validateConfigFormat(provider, environment, config);

  for (const field of def.secretFields) {
    const value = input[field];
    // Empty or still-masked means "keep the existing value".
    if (value === undefined || value === '' || isMasked(value)) continue;
    if (value === null) {
      if (secrets[field]) { delete secrets[field]; changed.push(field); }
      continue;
    }
    validateSecretFormat(provider, environment, field, value);
    secrets[field] = encrypt(value, aadFor(provider, environment, field));
    changed.push(field);
  }

  if (existing && changed.length === 0) {
    const row = await prisma.integrationSetting.findUnique({
      where: { id: existing.id }, include: { updatedBy: UPDATED_BY_SELECT },
    });
    return { setting: toView(provider, environment, row), changedFields: [] };
  }

  const row = await prisma.$transaction(async (tx) => {
    // The first environment configured for a provider becomes the active one.
    let isActive = existing?.isActive;
    if (!existing) {
      isActive = !def.switchable
        || !(await tx.integrationSetting.findFirst({ where: { provider, isActive: true } }));
    }

    const saved = await tx.integrationSetting.upsert({
      where:  { provider_environment: { provider, environment } },
      create: { provider, environment, config, secrets, isActive, updatedById: actorId },
      update: { config, secrets, updatedById: actorId },
      include: { updatedBy: UPDATED_BY_SELECT },
    });

    // Field names only — never values.
    await tx.auditLog.create({
      data: {
        adminId:    actorId,
        actionType: 'integration_settings_updated',
        targetType: 'integration_setting',
        targetId:   saved.id,
        newValue:   { provider, environment, fields: changed.length ? changed : ['(created)'] },
      },
    });
    return saved;
  });

  invalidate(provider);
  return { setting: toView(provider, environment, row), changedFields: changed };
}

async function setActiveEnvironment(provider, environment, actorId) {
  const def = getProvider(provider);
  if (!def.switchable) throw new AppError('This integration has no test/live mode', 400, 'VALIDATION_ERROR');
  if (!def.environments.includes(environment)) throw new AppError('Invalid environment', 400, 'VALIDATION_ERROR');

  const target = await prisma.integrationSetting.findUnique({
    where: { provider_environment: { provider, environment } },
  });
  const missing = [
    ...def.requiredToActivate.filter((f) => !target?.secrets?.[f]),
    ...def.requiredConfigToActivate.filter((f) => !target?.config?.[f]),
  ];
  if (!target || missing.length) {
    throw new AppError(
      `Save the ${environment} settings first (missing: ${missing.join(', ') || 'all fields'})`,
      400, 'INTEGRATION_INCOMPLETE'
    );
  }
  if (target.isActive) return { activeEnvironment: environment, changed: false };

  const previous = await prisma.integrationSetting.findFirst({ where: { provider, isActive: true } });

  await prisma.$transaction([
    prisma.integrationSetting.updateMany({ where: { provider, isActive: true }, data: { isActive: false } }),
    prisma.integrationSetting.update({ where: { id: target.id }, data: { isActive: true, updatedById: actorId } }),
    prisma.auditLog.create({
      data: {
        adminId:       actorId,
        actionType:    'integration_mode_changed',
        targetType:    'integration_setting',
        targetId:      target.id,
        previousValue: { provider, environment: previous?.environment ?? null },
        newValue:      { provider, environment },
      },
    }),
  ]);

  invalidate(provider);
  return { activeEnvironment: environment, changed: true };
}

async function recordConnectionTest(provider, environment, settingId, actorId, ok) {
  await prisma.auditLog.create({
    data: {
      adminId:    actorId,
      actionType: 'integration_settings_tested',
      targetType: 'integration_setting',
      targetId:   settingId,
      newValue:   { provider, environment, ok },
    },
  });
}

module.exports = {
  PROVIDER_NAMES,
  SUPPORTED_COURIERS,
  getActive,
  getForEnvironment,
  getPayoutHoldDays,
  listForAdmin,
  updateProvider,
  setActiveEnvironment,
  recordConnectionTest,
  invalidate,
};
