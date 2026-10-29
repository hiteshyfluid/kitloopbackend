const Stripe = require('stripe');
const AppError = require('../utils/AppError');

// Stripe credentials come from the super admin's Integrations settings (stored
// encrypted in the DB, with separate test/live keys). STRIPE_SECRET_KEY /
// STRIPE_WEBHOOK_SECRET in .env are only a fallback until those are set.
//
// The default export keeps the familiar `stripe.paymentIntents.create(...)` shape:
// every call resolves the currently active key first, so switching keys or
// test/live mode in the admin takes effect without a restart.

function createStripeClient(secretKey, options = {}) {
  return Stripe(secretKey, options);
}

// Lazy-required to avoid a circular import with the settings service.
const settings = () => require('../services/integrationSettingsService');

const clients = new Map(); // secret key → Stripe client

async function activeStripeSettings() {
  try {
    return await settings().getActive('stripe');
  } catch (err) {
    // Settings table missing (migration not applied) or unreadable — fall back to .env
    console.warn('[stripe] could not load Stripe settings from the database:', err.message);
    return null;
  }
}

async function getStripeClient() {
  const active = await activeStripeSettings();
  const secretKey = active?.secrets?.secret_key || process.env.STRIPE_SECRET_KEY;
  if (active && !active.secrets?.secret_key && secretKey) {
    // The frontend gets the DB publishable key, so this pairing is likely a different account.
    console.warn(`[stripe] active ${active.environment} settings have no usable secret key (missing, or SETTINGS_ENCRYPTION_KEY changed) — falling back to STRIPE_SECRET_KEY from .env`);
  }
  if (!secretKey) {
    throw new AppError('Payments are not configured yet. A super admin needs to add the Stripe keys in Admin → Payment settings.', 503, 'STRIPE_NOT_CONFIGURED');
  }
  if (!clients.has(secretKey)) clients.set(secretKey, createStripeClient(secretKey));
  return clients.get(secretKey);
}

async function getWebhookSecret() {
  const active = await activeStripeSettings();
  return active?.secrets?.webhook_secret || process.env.STRIPE_WEBHOOK_SECRET || null;
}

// Signature verification needs no API key, so a keyless client's helper is fine.
const webhooks = Stripe('sk_test_signature_verification_only').webhooks;

const helpers = { createStripeClient, getStripeClient, getWebhookSecret, webhooks };

// stripe.<resource>.<method>(...args) → (await getStripeClient()).<resource>.<method>(...args)
const stripe = new Proxy(helpers, {
  get(target, resource) {
    if (resource in target) return target[resource];
    if (typeof resource !== 'string') return undefined;
    return new Proxy({}, {
      get(_t, method) {
        if (typeof method !== 'string' || method === 'then') return undefined;
        return async (...args) => {
          const client = await getStripeClient();
          return client[resource][method](...args);
        };
      },
    });
  },
});

module.exports = stripe;
