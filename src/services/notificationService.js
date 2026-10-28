const prisma = require('../lib/prisma');

async function notify(userId, type, title, body, referenceId = null, referenceType = null) {
  try {
    await prisma.notification.create({
      data: { userId, type, title, body, referenceId, referenceType },
    });
  } catch (err) {
    console.error('[notify] Failed:', err.message);
  }
}

async function notifyOrderPlaced(order) {
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
      `You've sold "${order.snapshotListingTitle}". Please dispatch within 3 days.`,
      order.id,
      'order'
    ),
  ]);
}

async function notifyDispatched(order) {
  await notify(
    order.buyerId,
    'dispatched',
    'Your order is on its way',
    `"${order.snapshotListingTitle}" has been dispatched.${order.trackingNumber ? ` Tracking: ${order.trackingNumber}` : ''}`,
    order.id,
    'order'
  );
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
  ]);
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
  notifyOrderPlaced,
  notifyDispatched,
  notifyDeliveryConfirmed,
  getNotifications,
  markRead,
  markAllRead,
};
