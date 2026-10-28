'use strict';

// Moov Parcel client. Credentials come from Admin → Settings → Integrations.
//
// Moov exposes two APIs with separate credentials:
//   billing — quotes (get-quote)             headers: client_name, customer_dc_id, customer_key
//   courier — labels, drop-off points, cancel headers: api-user, api-token
// Endpoints (rates, labels, …) are built on top of this in Phase 7.

const AppError = require('../utils/AppError');
const integrationSettings = require('../services/integrationSettingsService');

const NOT_CONFIGURED = 'Moov shipping is not configured. Contact the administrator.';
const TIMEOUT_MS = 15_000;

async function getMoovSettings() {
  const active = await integrationSettings.getActive('moov');
  if (!active?.secrets.api_token) throw new AppError(NOT_CONFIGURED, 503, 'MOOV_NOT_CONFIGURED');
  return active;
}

function headersFor(api, { config, secrets }) {
  if (api === 'billing') {
    return {
      client_name:    config.client_name,
      customer_dc_id: config.customer_dc_id,
      customer_key:   secrets.customer_key ?? '',
    };
  }
  return { 'api-user': config.api_user, 'api-token': secrets.api_token ?? '' };
}

// POSTs JSON to a Moov API. `settings` is the object from getMoovSettings()
// (or integrationSettings.getForEnvironment for connection tests).
async function moovRequest(settings, api, path, body) {
  const base = api === 'billing' ? settings.config.billing_base_url : settings.config.courier_base_url;
  let res;
  try {
    res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...headersFor(api, settings) },
      body:    JSON.stringify(body),
      signal:  AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    const reason = err.name === 'TimeoutError' ? 'timed out' : 'could not be reached';
    throw new AppError(`Moov ${api} API ${reason}`, 502, 'MOOV_UNAVAILABLE');
  }

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { /* non-JSON body */ }

  const bodyError = data && (data.error || data.errors || data.success === false);
  if (!res.ok || bodyError) {
    const detail = typeof data?.message === 'string' ? data.message
      : typeof data?.error === 'string' ? data.error
      : text.slice(0, 200);
    throw new AppError(`Moov ${api} API error (${res.status}): ${detail || 'no details'}`, 502, 'MOOV_ERROR');
  }
  return data;
}

module.exports = { getMoovSettings, moovRequest };
