'use strict';

// AES-256-GCM encryption for secrets stored at rest (integration API keys).
//
// Payload format: "v1:<iv b64>:<auth tag b64>:<ciphertext b64>"
// The version prefix leaves room for key rotation later.
// `aad` (additional authenticated data) binds a ciphertext to where it is stored,
// e.g. "stripe:live:secretKey", so a value can't be copied into another field.

const crypto = require('crypto');

const VERSION = 'v1';
const IV_BYTES = 12;
const MASK = '••••••••';

let cachedKey = null;

function getKey() {
  if (cachedKey) return cachedKey;
  const raw = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!raw) {
    throw new Error('SETTINGS_ENCRYPTION_KEY is not set');
  }
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) {
    throw new Error('SETTINGS_ENCRYPTION_KEY must be 32 bytes, base64-encoded');
  }
  cachedKey = key;
  return key;
}

// Called at boot so a missing/invalid key fails fast instead of on first use.
function assertEncryptionKey() {
  getKey();
}

function encrypt(plaintext, aad) {
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv('aes-256-gcm', getKey(), iv);
  if (aad) cipher.setAAD(Buffer.from(aad, 'utf8'));
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString('base64'), tag.toString('base64'), ciphertext.toString('base64')].join(':');
}

function decrypt(payload, aad) {
  const [version, iv, tag, ciphertext] = String(payload).split(':');
  if (version !== VERSION || !iv || !tag || !ciphertext) {
    throw new Error('Unsupported encrypted payload');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', getKey(), Buffer.from(iv, 'base64'));
  if (aad) decipher.setAAD(Buffer.from(aad, 'utf8'));
  decipher.setAuthTag(Buffer.from(tag, 'base64'));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, 'base64')), decipher.final()]).toString('utf8');
}

// "sk_test_51Hx…a4xK" → "sk_test_••••••••a4xK". Keeps a recognisable key prefix
// (sk_/rk_/pk_/whsec_) and, for long values, the last 4 characters.
function mask(value) {
  if (!value) return null;
  const prefix = (value.match(/^(?:sk|rk|pk)_(?:test|live)_|^whsec_/) || [''])[0];
  const tail = value.length >= 16 ? value.slice(-4) : '';
  return `${prefix}${MASK}${tail}`;
}

function isMasked(value) {
  return typeof value === 'string' && value.includes('•');
}

module.exports = { assertEncryptionKey, encrypt, decrypt, mask, isMasked };
