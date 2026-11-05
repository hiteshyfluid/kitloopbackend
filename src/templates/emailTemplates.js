// Transactional email templates.
// Table layout + inline styles only — Gmail, Outlook and Apple Mail ignore
// <style> blocks and flexbox, so this is what renders consistently everywhere.

const BRAND = {
  name: 'The Kit Loop',
  teal: '#206954',
  tealDark: '#1A5644',
  terracotta: '#AF513B',
  charcoal: '#3B3838',
  muted: '#6E6A6A',
  ivory: '#F6F3F4',
  line: '#E2DCDE',
  font: "'DM Sans', Arial, Helvetica, sans-serif",
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function logoBlock(logoUrl) {
  if (logoUrl) {
    return `<img src="${escapeHtml(logoUrl)}" alt="${BRAND.name}" height="40" style="display:block;margin:0 auto;height:40px;max-width:200px;border:0;">`;
  }
  return `<span style="font-family:${BRAND.font};font-size:24px;font-weight:800;letter-spacing:-0.5px;color:${BRAND.teal};">${BRAND.name}</span>`;
}

// Envelope icon flanked by rules, as in the banner of the reference design
const ENVELOPE_DIVIDER = `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 18px;">
    <tr>
      <td style="width:44px;border-top:1px solid rgba(255,255,255,0.7);font-size:0;line-height:0;">&nbsp;</td>
      <td style="padding:0 12px;font-size:18px;line-height:18px;color:#ffffff;">&#9993;</td>
      <td style="width:44px;border-top:1px solid rgba(255,255,255,0.7);font-size:0;line-height:0;">&nbsp;</td>
    </tr>
  </table>`;

function button(href, label) {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 4px;">
    <tr>
      <td bgcolor="${BRAND.terracotta}" style="border-radius:6px;">
        <a href="${escapeHtml(href)}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:${BRAND.font};font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:6px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function layout({ preheader, eyebrow, title, bodyHtml, logoUrl }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.ivory};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.ivory};">
  <tr>
    <td align="center" style="padding:32px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BRAND.line};border-radius:12px;overflow:hidden;">
        <tr>
          <td align="center" style="padding:28px 24px;">${logoBlock(logoUrl)}</td>
        </tr>
        <tr>
          <td align="center" bgcolor="${BRAND.teal}" style="background:${BRAND.teal};padding:40px 24px;">
            ${ENVELOPE_DIVIDER}
            ${eyebrow ? `<div style="font-family:${BRAND.font};font-size:15px;letter-spacing:2px;text-transform:uppercase;color:#ffffff;opacity:0.9;margin-bottom:10px;">${escapeHtml(eyebrow)}</div>` : ''}
            <div style="font-family:${BRAND.font};font-size:28px;line-height:1.25;font-weight:700;color:#ffffff;">${escapeHtml(title)}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 36px;font-family:${BRAND.font};font-size:15px;line-height:1.7;color:${BRAND.charcoal};">
            ${bodyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px;border-top:1px solid ${BRAND.line};font-family:${BRAND.font};font-size:12px;line-height:1.6;color:${BRAND.muted};text-align:center;">
            You’re receiving this email because of activity on your ${BRAND.name} account.<br>
            &copy; ${year} ${BRAND.name}. All rights reserved.
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function otpBoxes(code) {
  const cells = String(code)
    .split('')
    .map((digit) => `
      <td style="padding:0 4px;">
        <div style="width:44px;height:52px;line-height:52px;border:1.5px solid ${BRAND.teal};border-radius:8px;text-align:center;font-family:${BRAND.font};font-size:26px;font-weight:700;color:${BRAND.teal};">${escapeHtml(digit)}</div>
      </td>`)
    .join('');
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:18px 0 20px -4px;">
    <tr>${cells}</tr>
  </table>`;
}

// ─── Email verification (6-digit code) ────────────────────────────────────────
function verificationEmail({ name, code, verifyUrl, expiresInMinutes, logoUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
    <p style="margin:0;">Please use the following One Time Password (OTP) to verify your email address:</p>
    ${otpBoxes(code)}
    <p style="margin:0 0 20px;">This passcode will only be valid for the next <strong>${expiresInMinutes} minutes</strong>. You can also verify in one click:</p>
    ${button(verifyUrl, 'Verify Email')}
    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};">If you didn’t create a ${BRAND.name} account, you can safely ignore this email. Never share this code with anyone — our team will never ask for it.</p>`;

  return {
    subject: `${code} is your verification code for The Kit Loop`,
    html: layout({
      preheader: `Your verification code is ${code}. It expires in ${expiresInMinutes} minutes.`,
      eyebrow: 'Thanks for signing up!',
      title: 'Verify Your E-Mail Address',
      bodyHtml,
      logoUrl,
    }),
    text: `Hello ${name},\n\nYour ${BRAND.name} verification code is: ${code}\n\nIt is valid for the next ${expiresInMinutes} minutes. Or verify in one click: ${verifyUrl}\n\nIf you didn't create an account, you can ignore this email.`,
  };
}

// ─── Password reset ───────────────────────────────────────────────────────────
function passwordResetEmail({ name, resetUrl, expiresInMinutes, logoUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 12px;">Hello ${escapeHtml(name)},</p>
    <p style="margin:0 0 20px;">We received a request to reset your password. This link is valid for the next <strong>${expiresInMinutes} minutes</strong>.</p>
    ${button(resetUrl, 'Reset Password')}
    <p style="margin:24px 0 0;font-size:13px;color:${BRAND.muted};">If you didn’t request this, you can safely ignore this email — your password won’t change.</p>`;

  return {
    subject: `Reset your ${BRAND.name} password`,
    html: layout({
      preheader: 'Use the button inside to choose a new password.',
      eyebrow: 'Account security',
      title: 'Reset Your Password',
      bodyHtml,
      logoUrl,
    }),
    text: `Hello ${name},\n\nReset your ${BRAND.name} password here (valid for ${expiresInMinutes} minutes): ${resetUrl}\n\nIf you didn't request this, ignore this email.`,
  };
}

// ─── Security alerts (lockout, password change, 2FA off, …) ──────────────────
function securityAlertEmail({ subject, body, logoUrl }) {
  return {
    subject,
    html: layout({
      preheader: body,
      eyebrow: 'Security alert',
      title: subject.replace(/^(The )?Kit Loop security alert:\s*/i, ''),
      bodyHtml: `<p style="margin:0;">${escapeHtml(body)}</p>`,
      logoUrl,
    }),
    text: body,
  };
}

// ─── Admin: a new listing went live ───────────────────────────────────────────
function newListingAdminEmail({ listing, adminUrl, listingUrl, logoUrl }) {
  const price = `£${Number(listing.price).toFixed(2)}`;
  const seller = listing.seller?.displayName || listing.seller?.username || 'A seller';
  const photo = Array.isArray(listing.photos) ? listing.photos[0] : null;
  const rows = [
    ['Seller', `${seller}${listing.seller?.username ? ` (@${listing.seller.username})` : ''}`],
    ['Price', price],
    ['Sport', listing.sport?.name],
    ['Category', listing.subCategory?.name],
    ['Brand', listing.brand?.name],
    ['Condition', listing.condition?.replace(/_/g, ' ')],
  ].filter(([, v]) => v);

  const bodyHtml = `
    <p style="margin:0 0 16px;">A new listing has just gone live on ${BRAND.name}. No approval is needed — this is for your information.</p>
    ${photo ? `<img src="${escapeHtml(photo)}" alt="" width="160" style="display:block;width:160px;max-width:100%;border-radius:8px;margin:0 0 16px;border:0;">` : ''}
    <p style="margin:0 0 12px;font-size:17px;font-weight:700;">${escapeHtml(listing.title)}</p>
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;font-family:${BRAND.font};font-size:14px;">
      ${rows.map(([k, v]) => `<tr><td style="padding:3px 16px 3px 0;color:${BRAND.muted};">${escapeHtml(k)}</td><td style="padding:3px 0;">${escapeHtml(v)}</td></tr>`).join('')}
    </table>
    ${button(adminUrl, 'Review in admin')}
    <p style="margin:16px 0 0;font-size:13px;color:${BRAND.muted};">Or view it on the site: <a href="${escapeHtml(listingUrl)}" style="color:${BRAND.teal};">${escapeHtml(listingUrl)}</a></p>`;

  return {
    subject: `New listing: ${listing.title} (${price})`,
    html: layout({
      preheader: `${seller} listed "${listing.title}" for ${price}.`,
      eyebrow: 'Admin notification',
      title: 'New Product Uploaded',
      bodyHtml,
      logoUrl,
    }),
    text: `A new listing has gone live on ${BRAND.name}.\n\n${listing.title} — ${price}\nSeller: ${seller}\n\nReview: ${adminUrl}\nView: ${listingUrl}`,
  };
}

module.exports = { verificationEmail, passwordResetEmail, securityAlertEmail, newListingAdminEmail };
