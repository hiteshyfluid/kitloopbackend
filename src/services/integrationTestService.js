'use strict';

// "Test connection" checks for the Integrations settings page.
// Every call here is read-only: no charges, labels or bookings are created.

const { createStripeClient } = require('../lib/stripe');
const { moovRequest } = require('../lib/moov');

// Moov's own sample addresses from the Postman collection.
const SAMPLE_FROM = {
  name: 'Kit Loop Test', phone: '07000000000', email: '', company_name: '',
  address_1: '2 Infirmary Street', address_2: '', address_3: '',
  city: 'Leeds', county: '', postcode: 'LS1 2JP', country_iso: 'GB',
};
const SAMPLE_TO = {
  name: 'Kit Loop Test', phone: '07000000000', email: '', company_name: null,
  address_1: '9 Mellor Meadows', address_2: 'Whittington', address_3: '',
  city: 'Oswestry', county: 'Shropshire', postcode: 'SY11 4FN', country_iso: 'GB',
};

async function testStripe(settings) {
  const { secrets, config, environment } = settings;
  const warnings = [];
  if (!secrets.secret_key) {
    return { ok: false, message: 'No secret key saved for this environment.', warnings };
  }
  if (!config.publishable_key) warnings.push('Publishable key is not set — checkout cannot load Stripe.js.');
  if (!secrets.webhook_secret) warnings.push('Webhook signing secret is not set — payment confirmations will not be received.');

  try {
    const client = createStripeClient(secrets.secret_key, { timeout: 10_000, maxNetworkRetries: 0 });
    const balance = await client.balance.retrieve();
    const mode = balance.livemode ? 'live' : 'test';
    if (mode !== environment) warnings.push(`Key is a ${mode}-mode key but is saved under ${environment}.`);
    return { ok: true, message: `Connected to Stripe (${mode} mode).`, warnings };
  } catch (err) {
    const message = err.type === 'StripeAuthenticationError'
      ? 'Stripe rejected the secret key.'
      : `Stripe error: ${err.message}`;
    return { ok: false, message, warnings };
  }
}

async function testMoov(settings) {
  const { config, secrets, environment } = settings;
  const testing = environment !== 'live';
  const courier = config.enabled_couriers?.[0];
  const checks = [];

  // Courier API (labels, drop-off points, cancellations)
  if (!secrets.api_token || !config.api_user) {
    checks.push({ name: 'Courier API', ok: false, message: 'API user and API token are required.' });
  } else if (!courier) {
    checks.push({ name: 'Courier API', ok: false, message: 'Enable at least one courier.' });
  } else {
    try {
      await moovRequest(settings, 'courier', '/api/couriers/v1/MoovParcel/get-pickup-locations', {
        testing,
        auth_company: config.auth_company,
        courier:      { courier, auth_company: config.courier_auth_company },
        address:      SAMPLE_TO,
      });
      checks.push({ name: 'Courier API', ok: true, message: `Drop-off lookup succeeded (${courier}).` });
    } catch (err) {
      checks.push({ name: 'Courier API', ok: false, message: err.message });
    }
  }

  // Billing API (quotes)
  if (!secrets.customer_key || !config.customer_dc_id) {
    checks.push({ name: 'Billing API', ok: false, message: 'Customer DC ID and customer key are required.' });
  } else {
    try {
      await moovRequest(settings, 'billing', '/api/customer-routes/get-quote', {
        auth_company: config.auth_company,
        format_address_default: true,
        request_id: `kitloop-test-${Date.now()}`,
        shipment: {
          label_size: '6x4', label_format: 'pdf',
          generate_invoice: false, generate_packing_slip: false,
          collection_date: new Date(Date.now() + 86_400_000).toISOString().slice(0, 10) + ' 18:00:00',
          reference: 'connection-test', reference_2: '', delivery_instructions: '',
          ship_from: SAMPLE_FROM,
          ship_to:   SAMPLE_TO,
          parcels: [{
            dim_width: 10, dim_height: 20, dim_length: 30, dim_unit: 'cm',
            items: [{
              description: 'Connection test', origin_country: 'GB', quantity: 1,
              value_currency: 'GBP', weight: 1, weight_unit: 'KG', value: '0.00',
            }],
          }],
        },
      });
      checks.push({ name: 'Billing API', ok: true, message: 'Quote request succeeded.' });
    } catch (err) {
      checks.push({ name: 'Billing API', ok: false, message: err.message });
    }
  }

  const ok = checks.every((c) => c.ok);
  return {
    ok,
    message: ok ? 'Connected to Moov.' : 'One or more Moov checks failed.',
    checks,
  };
}

module.exports = { testStripe, testMoov };
