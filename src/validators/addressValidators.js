const { z } = require('zod');

// UK-only for now — couriers reject labels with malformed postcodes / phones.
const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;
const UK_PHONE_RE = /^(?:\+44|0)\d{9,10}$/;

// "sw1a1aa" / "SW1A 1AA" → "SW1A 1AA"
const ukPostcode = z.string().trim()
  .transform((v) => v.toUpperCase().replace(/\s+/g, ''))
  .refine((v) => UK_POSTCODE_RE.test(v), { message: 'Enter a valid UK postcode' })
  .transform((v) => `${v.slice(0, -3)} ${v.slice(-3)}`);

// "07700 900-123" → "07700900123"
const ukPhone = z.string().trim()
  .transform((v) => v.replace(/[\s()-]/g, ''))
  .refine((v) => UK_PHONE_RE.test(v), { message: 'Enter a valid UK phone number' });

const fullName = z.string().trim().min(2, 'Full name is required').max(100);
const firstName = z.string().trim().min(1, 'First name is required').max(50);
const lastName = z.string().trim().min(1, 'Last name is required').max(50);

module.exports = { ukPostcode, ukPhone, fullName, firstName, lastName };
