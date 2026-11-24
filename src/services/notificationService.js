const prisma = require('../lib/prisma');
const emailTemplates = require('../templates/emailTemplates');
const { sendEmail, getEmailLogoUrl, clientUrl } = require('./emailService');

async function notify(userId, type, title, body, referenceId = null, referenceType = null) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, referenceId, referenceType },
    });
  } catch (err) {
    console.error('[notify] Failed:', err.message);
  }
}

// ─── Email ───────────────────────────────────────────────────────────────────
// Emails go to active accounts only. `pref` is the user's opt-out column
// (notification_messages / notification_order_updates); null means the email
// is essential to the transaction (receipts, "please ship") and always sent.

async function emailUser(userId, pref, build) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true, displayName: true, username: true, accountStatus: true, deletedAt: true,
      notificationMessages: true, notificationOrderUpdates: true,
    },
  });
  if (!user?.email || user.deletedAt || user.accountStatus !== 'active') return;
  if (pref && user[pref] === false) return;

  const message = build({ name: user.displayName || user.username, logoUrl: await getEmailLogoUrl() });
  await sendEmail({ to: user.email, ...message });
}

function safeEmail(label, userId, pref, build) {
  return emailUser(userId, pref, build).catch((e) => console.error(`[email] ${label}:`, e.message));
}

const orderUrl   = (orderId) => `${clientUrl()}/orders/${orderId}`;
const threadUrl  = (offerId) => `${clientUrl()}/messages?thread=${offerId}`;
const listingUrl = (listingId) => `${clientUrl()}/listing/${listingId}`;

async function getDispatchWindowDays() {
  const row = await prisma.feeConfig.findUnique({ where: { configKey: 'dispatch_window_days' } }).catch(() => null);
  return row ? Number(row.configValue) : 5;
}

// ─── Offers ──────────────────────────────────────────────────────────────────
// `listing` is { id, title, price, photo }

function emailOfferReceived(sellerId, { offerId, listing, amount }) {
  return safeEmail('offer_received', sellerId, 'notificationMessages', (ctx) =>
    emailTemplates.offerReceivedEmail({ ...ctx, listing, amount, url: threadUrl(offerId) }));
}

// kind: accepted | declined | counter
function emailOfferResponse(buyerId, { kind, offerId, listing, amount, expiresAt }) {
  const url = kind === 'accepted' ? listingUrl(listing.id) : threadUrl(offerId);
  return safeEmail(`offer_${kind}`, buyerId, 'notificationMessages', (ctx) =>
    emailTemplates.offerResponseEmail({ ...ctx, kind, listing, amount, expiresAt, url }));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

// The sale also appears in the buyer↔seller conversation, so the seller sees it
// in Messages as well as Orders.
async function postSaleMessage(order) {
  const body = `Order placed. Please create the DPD label from My orders and drop the parcel at any DPD Pickup shop within ${await getDispatchWindowDays()} days.`;
  const thread = await prisma.offer.upsert({
    where:  { listingId_buyerId: { listingId: order.listingId, buyerId: order.buyerId } },
    create: { listingId: order.listingId, buyerId: order.buyerId, sellerId: order.sellerId },
    update: {},
    select: { id: true },
  });
  const msg = await prisma.message.create({
    data: { offerId: thread.id, senderId: order.buyerId, messageType: 'system', body },
    select: { createdAt: true },
  });
  await prisma.offer.update({
    where: { id: thread.id },
    data: {
      lastMessageAt: msg.createdAt,
      lastMessagePreview: body.slice(0, 60),
      sellerUnreadCount: { increment: 1 },
    },
  });
}

async function notifyOrderPlaced(order) {
  const dispatchDays = await getDispatchWindowDays();
  await Promise.all([
    notify(
      order.buyerId,
      'order_placed',
      'Order confirmed',
      `Your order for "${order.snapshotListingTitle}" is confirmed. The seller will dispatch soon.`,
      order.id,
      'order'
    ),
    notify(
      order.sellerId,
      'order_placed',
      'New sale!',
      `You've sold "${order.snapshotListingTitle}". Create the DPD label within ${dispatchDays} days or the order is cancelled and refunded.`,
      order.id,
      'order'
    ),
    postSaleMessage(order).catch((e) => console.error('[notify] sale message:', e.message)),
    safeEmail('order_confirmation', order.buyerId, null, (ctx) =>
      emailTemplates.orderConfirmationEmail({ ...ctx, order, url: orderUrl(order.id) })),
    safeEmail('new_sale', order.sellerId, null, (ctx) =>
      emailTemplates.newSaleEmail({ ...ctx, order, url: orderUrl(order.id), dispatchDays })),
  ]);
}

async function notifyDispatched(order) {
  await Promise.all([
    notify(
      order.buyerId,
      'dispatched',
      'Your order is on its way',
      `"${order.snapshotListingTitle}" has been dispatched.${order.trackingNumber ? ` Tracking: ${order.trackingNumber}` : ''}`,
      order.id,
      'order'
    ),
    safeEmail('order_shipped', order.buyerId, 'notificationOrderUpdates', (ctx) =>
      emailTemplates.orderShippedEmail({ ...ctx, order, url: orderUrl(order.id) })),
  ]);
}

async function notifyDeliveryConfirmed(order) {
  await Promise.all([
    notify(
      order.buyerId,
      'delivered',
      'Thanks for your purchase!',
      `Your order for "${order.snapshotListingTitle}" is complete. Payment has been released to the seller.`,
      order.id,
      'order'
    ),
    notify(
      order.sellerId,
      'payout_initiated',
      'Payout pending',
      `Payment for "${order.snapshotListingTitle}" is queued for payout.`,
      order.id,
      'order'
    ),
    emailOrderDelivered(order),
  ]);
}

// Delivered / completed email — also used by the auto-release job (and later
// by courier tracking updates).
function emailOrderDelivered(order) {
  return safeEmail('order_delivered', order.buyerId, 'notificationOrderUpdates', (ctx) =>
    emailTemplates.orderDeliveredEmail({ ...ctx, order, url: orderUrl(order.id) }));
}

// Courier marked the parcel delivered (tracking webhook)
async function notifyArrived(order) {
  await Promise.all([
    notify(order.buyerId, 'delivered', 'Your order has arrived',
      `"${order.snapshotListingTitle}" has been delivered. Check it and confirm, or raise an issue if it isn't as described.`,
      order.id, 'order'),
    safeEmail('order_arrived', order.buyerId, null, (ctx) =>
      emailTemplates.orderArrivedEmail({ ...ctx, order, url: orderUrl(order.id) })),
  ]);
}

// DPD left the parcel at a shop for the buyer to collect
async function notifyAwaitingCollection(order) {
  const where = order.collectionPointName ? ` at ${order.collectionPointName}` : '';
  await Promise.all([
    notify(order.buyerId, 'awaiting_collection', 'Your parcel is ready to collect',
      `"${order.snapshotListingTitle}" is waiting for you${where}. Collect it before it's sent back.`,
      order.id, 'order'),
    safeEmail('awaiting_collection', order.buyerId, null, (ctx) =>
      emailTemplates.awaitingCollectionEmail({ ...ctx, order, url: orderUrl(order.id), reminder: false })),
  ]);
}

// "Less than 24 hours left to collect" (jobs/shippingDeadlines.js)
function emailCollectionReminder(order) {
  return emailUser(order.buyerId, null, (ctx) =>
    emailTemplates.awaitingCollectionEmail({ ...ctx, order, url: orderUrl(order.id), reminder: true }));
}

// Seller missed the dispatch window — order cancelled and refunded
async function notifyOrderCancelled(order) {
  await Promise.all([
    notify(order.buyerId, 'order_cancelled', 'Order cancelled and refunded',
      `The seller didn't ship "${order.snapshotListingTitle}" in time, so we've refunded you in full.`,
      order.id, 'order'),
    notify(order.sellerId, 'order_cancelled', 'Order cancelled',
      `"${order.snapshotListingTitle}" wasn't shipped in time. The order was cancelled, the buyer refunded and your item relisted.`,
      order.id, 'order'),
    safeEmail('order_cancelled_buyer', order.buyerId, null, (ctx) =>
      emailTemplates.orderCancelledEmail({ ...ctx, order, role: 'buyer', url: orderUrl(order.id) })),
    safeEmail('order_cancelled_seller', order.sellerId, null, (ctx) =>
      emailTemplates.orderCancelledEmail({ ...ctx, order, role: 'seller', url: orderUrl(order.id) })),
  ]);
}

// Daily "please ship" reminder (jobs/dispatchReminder.js)
function emailDispatchReminder(order, { daysLeft, deadline }) {
  return emailUser(order.sellerId, null, (ctx) =>
    emailTemplates.dispatchReminderEmail({ ...ctx, order, daysLeft, deadline, url: orderUrl(order.id) }));
}

// ─── notifyAdminsNewListing ──────────────────────────────────────────────────
// Every new listing that goes live → a dashboard notification for each admin
// plus an email. Listings don't need approval; this is for awareness only.
// Extra recipients can be set with ADMIN_NOTIFICATION_EMAILS (comma separated).
async function notifyAdminsNewListing(listingId) {
  const [listing, admins] = await Promise.all([
    prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true, title: true, price: true, condition: true, photos: true,
        seller: { select: { username: true, displayName: true } },
        sport: { select: { name: true } },
        subCategory: { select: { name: true } },
        brand: { select: { name: true } },
      },
    }),
    prisma.user.findMany({
      where: { role: { in: ['admin', 'super_admin'] }, accountStatus: 'active', deletedAt: null },
      select: { id: true, email: true },
    }),
  ]);
  if (!listing) return;

  const seller = listing.seller?.displayName || listing.seller?.username || 'A seller';
  const body = `${seller} listed "${listing.title}" for £${Number(listing.price).toFixed(2)}.`;
  await Promise.all(admins.map((a) => notify(a.id, 'listing_uploaded', 'New product uploaded', body, listing.id, 'listing')));

  const extra = (process.env.ADMIN_NOTIFICATION_EMAILS || '').split(',').map((e) => e.trim()).filter(Boolean);
  const recipients = [...new Set([...admins.map((a) => a.email), ...extra].map((e) => e.toLowerCase()))];
  if (!recipients.length) return;

  const message = emailTemplates.newListingAdminEmail({
    listing,
    adminUrl: `${clientUrl()}/admin/listings/${listing.id}`,
    listingUrl: `${clientUrl()}/listing/${listing.id}`,
    logoUrl: await getEmailLogoUrl(),
  });
  const results = await Promise.allSettled(recipients.map((to) => sendEmail({ to, ...message })));
  results.forEach((r, i) => {
    if (r.status === 'rejected') console.error(`[notify] new listing email to ${recipients[i]} failed:`, r.reason?.message);
  });
}

// ─── getNotifications ────────────────────────────────────────────────────────
async function getNotifications(userId, { page = 1, pageSize = 20, unreadOnly = false } = {}) {
  const where = { userId, ...(unreadOnly ? { isRead: false } : {}) };
  const skip  = (page - 1) * pageSize;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { notifications, total, page, pageSize, totalPages: Math.ceil(total / pageSize), unreadCount };
}

// ─── markRead ────────────────────────────────────────────────────────────────
async function markRead(notificationId, userId) {
  const n = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!n) throw new (require('../utils/AppError'))('Notification not found', 404, 'NOT_FOUND');
  if (n.userId !== userId) throw new (require('../utils/AppError'))('Forbidden', 403, 'FORBIDDEN');
  return prisma.notification.update({ where: { id: notificationId }, data: { isRead: true } });
}

// ─── markAllRead ─────────────────────────────────────────────────────────────
async function markAllRead(userId) {
  const { count } = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data:  { isRead: true },
  });
  return { updated: count };
}

module.exports = {
  notify,
  emailOfferReceived,
  emailOfferResponse,
  emailOrderDelivered,
  emailDispatchReminder,
  emailCollectionReminder,
  notifyArrived,
  notifyAwaitingCollection,
  notifyOrderCancelled,
  getDispatchWindowDays,
  notifyOrderPlaced,
  notifyDispatched,
  notifyDeliveryConfirmed,
  notifyAdminsNewListing,
  getNotifications,
  markRead,
  markAllRead,
};
