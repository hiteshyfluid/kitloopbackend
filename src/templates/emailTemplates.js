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

// ─── Marketplace notifications (offers, orders, reminders) ───────────────────

const money = (v) => `£${Number(v ?? 0).toFixed(2)}`;
const dateLong = (d) => new Date(d).toLocaleString('en-GB', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/London',
});

function itemCard(title, photo) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;">
      <tr>
        ${photo ? `<td style="padding:0 14px 0 0;vertical-align:top;"><img src="${escapeHtml(photo)}" alt="" width="72" height="72" style="display:block;width:72px;height:72px;object-fit:cover;border-radius:8px;border:0;"></td>` : ''}
        <td style="vertical-align:middle;font-family:${BRAND.font};font-size:16px;font-weight:700;color:${BRAND.charcoal};">${escapeHtml(title)}</td>
      </tr>
    </table>`;
}

function detailRows(rows) {
  const shown = rows.filter(([, v]) => v != null && v !== '');
  if (!shown.length) return '';
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 20px;font-family:${BRAND.font};font-size:14px;border-top:1px solid ${BRAND.line};">
      ${shown.map(([k, v, strong]) => `<tr>
        <td style="padding:8px 16px 8px 0;color:${BRAND.muted};border-bottom:1px solid ${BRAND.line};">${escapeHtml(k)}</td>
        <td align="right" style="padding:8px 0;border-bottom:1px solid ${BRAND.line};${strong ? 'font-weight:700;' : ''}">${escapeHtml(v)}</td>
      </tr>`).join('')}
    </table>`;
}

// One layout for every marketplace email; `rows` are [label, value, bold?].
function noticeEmail({ subject, eyebrow, title, name, lines, item, rows = [], cta, footnote, logoUrl }) {
  const bodyHtml = `
    <p style="margin:0 0 12px;">Hi ${escapeHtml(name)},</p>
    ${lines.map((l) => `<p style="margin:0 0 14px;">${escapeHtml(l)}</p>`).join('')}
    ${item ? itemCard(item.title, item.photo) : ''}
    ${detailRows(rows)}
    ${cta ? button(cta.url, cta.label) : ''}
    ${footnote ? `<p style="margin:20px 0 0;font-size:13px;color:${BRAND.muted};">${escapeHtml(footnote)}</p>` : ''}`;

  const textRows = rows.filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}: ${v}`);
  return {
    subject,
    html: layout({ preheader: lines[0], eyebrow, title, bodyHtml, logoUrl }),
    text: [`Hi ${name},`, ...lines, item?.title, ...textRows, cta ? `${cta.label}: ${cta.url}` : null, footnote]
      .filter(Boolean).join('\n\n'),
  };
}

function offerReceivedEmail({ name, listing, amount, url, logoUrl }) {
  return noticeEmail({
    subject: `New offer of ${money(amount)} on “${listing.title}”`,
    eyebrow: 'New offer', title: 'You’ve Received an Offer', name, logoUrl,
    lines: [`A buyer has offered ${money(amount)} for your item. Accept or decline it in Messages — offers are first come, first served.`],
    item: listing,
    rows: [['Your price', money(listing.price)], ['Offer', money(amount), true]],
    cta: { url, label: 'Reply to offer' },
  });
}

// kind: accepted | declined | counter
function offerResponseEmail({ name, kind, listing, amount, expiresAt, url, logoUrl }) {
  const copy = {
    accepted: {
      subject: `Your offer on “${listing.title}” was accepted`,
      title: 'Your Offer Was Accepted!',
      line: `Good news — the seller accepted your offer of ${money(amount)}. Pay now to secure the item before the price hold ends.`,
      cta: 'Pay now',
    },
    declined: {
      subject: `Your offer on “${listing.title}” was declined`,
      title: 'Your Offer Was Declined',
      line: `The seller declined your offer of ${money(amount)}. You can make a new offer or buy it at the listed price.`,
      cta: 'View conversation',
    },
    counter: {
      subject: `Counter offer on “${listing.title}”`,
      title: 'You’ve Received a Counter Offer',
      line: `The seller has come back with ${money(amount)}. Accept it to buy at that price, or reply in Messages.`,
      cta: 'View counter offer',
    },
  }[kind];
  return noticeEmail({
    subject: copy.subject, eyebrow: 'Offer update', title: copy.title, name, logoUrl,
    lines: [copy.line],
    item: listing,
    rows: [
      ['Listed price', money(listing.price)],
      [kind === 'counter' ? 'Counter offer' : 'Your offer', money(amount), true],
      expiresAt ? ['Price held until', dateLong(expiresAt)] : null,
    ].filter(Boolean),
    cta: { url, label: copy.cta },
  });
}

function deliveryLine(order) {
  return [order.deliveryName, order.deliveryAddressLine1, order.deliveryAddressLine2, order.deliveryCity, order.deliveryPostcode]
    .filter(Boolean).join(', ');
}

const orderItem = (order) => ({ title: order.snapshotListingTitle, photo: Array.isArray(order.snapshotPhotos) ? order.snapshotPhotos[0] : null });
const orderRef = (order) => order.id.slice(0, 8).toUpperCase();

function orderConfirmationEmail({ name, order, url, logoUrl }) {
  return noticeEmail({
    subject: `Order confirmed: ${order.snapshotListingTitle}`,
    eyebrow: `Order #${orderRef(order)}`, title: 'Thanks for Your Order!', name, logoUrl,
    lines: ['Your payment is held safely by The Kit Loop until your item arrives as described. We’ll email you as soon as the seller ships it.'],
    item: orderItem(order),
    rows: [
      ['Item', money(order.itemPrice)],
      ['Postage', Number(order.shippingFee) === 0 ? 'Free' : money(order.shippingFee)],
      ['Buyer protection', money(order.buyerProtectionFee)],
      ['Total paid', money(order.totalAmount), true],
      ['Delivering to', deliveryLine(order)],
    ],
    cta: { url, label: 'View order' },
    footnote: 'If anything isn’t as described, raise it from your order page within the issue window after delivery.',
  });
}

function newSaleEmail({ name, order, url, dispatchDays, logoUrl }) {
  return noticeEmail({
    subject: `You sold “${order.snapshotListingTitle}” — please ship within ${dispatchDays} days`,
    eyebrow: `Order #${orderRef(order)}`, title: 'You’ve Made a Sale!', name, logoUrl,
    lines: [
      `Please create your shipping label and drop the parcel at any DPD Pickup shop within ${dispatchDays} days. Show the QR code on your phone or attach the printed label.`,
      `If it isn’t shipped within ${dispatchDays} days the order is cancelled and the buyer refunded.`,
      'You’ll be paid once the buyer confirms everything is as described.',
    ],
    item: orderItem(order),
    rows: [
      ['Sale price', money(order.itemPrice)],
      ['You’ll receive', money(order.sellerNetAmount), true],
      ['Delivery', order.deliveryMethod === 'seller' ? 'Tracked delivery (you arrange)' : 'DPD — drop off at a Pickup shop'],
    ],
    cta: { url, label: 'Create shipping label' },
  });
}

function dispatchReminderEmail({ name, order, daysLeft, deadline, url, logoUrl }) {
  const when = daysLeft <= 0 ? 'today' : daysLeft === 1 ? 'by tomorrow' : `within ${daysLeft} days`;
  return noticeEmail({
    subject: `Reminder: please ship “${order.snapshotListingTitle}” ${when}`,
    eyebrow: `Order #${orderRef(order)}`, title: daysLeft <= 0 ? 'Last Day to Ship' : 'Your Buyer Is Waiting', name, logoUrl,
    lines: [`Please ship this order ${when}. Create the label from your order page and drop the parcel at any DPD Pickup shop.`],
    item: orderItem(order),
    rows: [['Ship by', dateLong(deadline), true]],
    cta: { url, label: 'Ship now' },
    footnote: 'If the order isn’t shipped by then it will be cancelled automatically and the buyer refunded in full.',
  });
}

function orderShippedEmail({ name, order, url, logoUrl }) {
  return noticeEmail({
    subject: `Your order has shipped: ${order.snapshotListingTitle}`,
    eyebrow: `Order #${orderRef(order)}`, title: 'Your Order Is on Its Way', name, logoUrl,
    lines: ['The seller has sent your item.'],
    item: orderItem(order),
    rows: [
      ['Courier', order.shippingCourier],
      ['Tracking number', order.trackingNumber],
      ['Delivering to', deliveryLine(order)],
    ],
    cta: order.trackingUrl ? { url: order.trackingUrl, label: 'Track parcel' } : { url, label: 'View order' },
    footnote: 'Once it arrives, check it and confirm on your order page — or raise an issue if it isn’t as described.',
  });
}

function orderDeliveredEmail({ name, order, url, logoUrl }) {
  return noticeEmail({
    subject: `Order complete: ${order.snapshotListingTitle}`,
    eyebrow: `Order #${orderRef(order)}`, title: 'Your Order Is Complete', name, logoUrl,
    lines: ['Your order has been delivered and completed. Thanks for buying pre-loved kit on The Kit Loop!'],
    item: orderItem(order),
    rows: [['Total paid', money(order.totalAmount)]],
    cta: { url, label: 'Leave a review' },
  });
}

// Courier says the parcel has been delivered — the buyer's issue window starts
function orderArrivedEmail({ name, order, url, logoUrl }) {
  return noticeEmail({
    subject: `Delivered: ${order.snapshotListingTitle}`,
    eyebrow: `Order #${orderRef(order)}`, title: 'Your Order Has Arrived', name, logoUrl,
    lines: [
      'DPD has delivered your parcel. Please check the item and confirm it’s as described.',
      'If something’s wrong, raise an issue from your order page before the window closes — after that the payment is released to the seller.',
    ],
    item: orderItem(order),
    rows: [['Raise an issue by', order.disputeWindowExpiresAt ? dateLong(order.disputeWindowExpiresAt) : null, true]],
    cta: { url, label: 'Check & confirm' },
  });
}

// DPD left the parcel at a shop; reminder: true for the "24 hours left" email
function awaitingCollectionEmail({ name, order, url, reminder, logoUrl }) {
  const where = [order.collectionPointName, order.collectionPointAddress].filter(Boolean).join(', ');
  return noticeEmail({
    subject: reminder
      ? `Reminder: collect your parcel by ${dateLong(order.collectBy)}`
      : `Your parcel is waiting for you to collect: ${order.snapshotListingTitle}`,
    eyebrow: `Order #${orderRef(order)}`,
    title: reminder ? 'Less Than 24 Hours to Collect' : 'Your Parcel Is Ready to Collect',
    name, logoUrl,
    lines: [
      reminder
        ? 'Your parcel is still waiting at the DPD shop. Please collect it before the deadline or it will be sent back.'
        : 'DPD couldn’t deliver to your door, so your parcel is waiting at a DPD shop. Take photo ID and your tracking number.',
    ],
    item: orderItem(order),
    rows: [
      ['Collect from', where || 'See DPD tracking'],
      ['Collect by', order.collectBy ? dateLong(order.collectBy) : null, true],
      ['Tracking number', order.trackingNumber],
    ],
    cta: order.trackingUrl ? { url: order.trackingUrl, label: 'View on DPD' } : { url, label: 'View order' },
  });
}

// role: buyer | seller
function orderCancelledEmail({ name, order, role, url, logoUrl }) {
  const buyer = role === 'buyer';
  return noticeEmail({
    subject: buyer
      ? `Order cancelled and refunded: ${order.snapshotListingTitle}`
      : `Order cancelled — not shipped in time: ${order.snapshotListingTitle}`,
    eyebrow: `Order #${orderRef(order)}`, title: 'Order Cancelled', name, logoUrl,
    lines: buyer
      ? ['The seller didn’t ship your order in time, so we’ve cancelled it and refunded you in full. Refunds usually reach your account within 5–10 working days.']
      : ['This order wasn’t shipped within the dispatch window, so it has been cancelled and the buyer refunded. Your item is back on sale.'],
    item: orderItem(order),
    rows: buyer ? [['Refunded', money(order.totalAmount), true]] : [],
    cta: { url, label: 'View order' },
    footnote: buyer ? null : 'Repeatedly missing the dispatch window may affect your seller account.',
  });
}

module.exports = {
  orderArrivedEmail,
  awaitingCollectionEmail,
  orderCancelledEmail,
  verificationEmail,
  passwordResetEmail,
  securityAlertEmail,
  newListingAdminEmail,
  offerReceivedEmail,
  offerResponseEmail,
  orderConfirmationEmail,
  newSaleEmail,
  dispatchReminderEmail,
  orderShippedEmail,
  orderDeliveredEmail,
};
