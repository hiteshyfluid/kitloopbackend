const AppError = require('../utils/AppError');

// Matches UK phone numbers (+44, 07xxx, 01xxx, etc.) and 10-11 digit runs
const PHONE_RE   = /(?:\+44|00\s?44|0(?:7|1|2|3|8))\s?(?:\d[\s\-]?){9,10}|\b\d{10,11}\b/;
const EMAIL_RE   = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const URL_RE     = /https?:\/\/\S+|www\.[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}/i;

function containsBlockedContent(text) {
  if (!text || typeof text !== 'string') return false;
  return PHONE_RE.test(text) || EMAIL_RE.test(text) || URL_RE.test(text);
}

// Scans req.body.body and req.body.message for contact details / external URLs.
// Apply to any route that accepts user-written text.
function scanContent(req, res, next) {
  const fieldsToCheck = ['body', 'message'];
  for (const field of fieldsToCheck) {
    if (containsBlockedContent(req.body[field])) {
      return next(
        new AppError(
          'For your protection, contact details and external links cannot be shared in messages',
          400,
          'CONTACT_DETAILS_BLOCKED'
        )
      );
    }
  }
  next();
}

module.exports = { scanContent };
