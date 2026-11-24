const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { cancelUnshippedOrder } = require('../services/orderService');
const { emailDispatchReminder, emailCollectionReminder, getDispatchWindowDays } = require('../services/notificationService');

// Shipping deadlines (UK time). The dispatch window is Admin → Fees →
// dispatch_window_days (default 5).
//   • 09:00 daily — sellers get one "please ship" email a day while an order
//     waits; the sale-day email is the first nudge, so reminders start the next day.
//   • Hourly — orders past the window are cancelled and the buyer refunded;
//     buyers whose parcel is waiting at a DPD shop get a "24 hours left" email.
//
// Every order is claimed with a conditional update before acting, so restarts
// or a second server instance can't send or refund twice.
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_GAP_MS = 20 * 60 * 60 * 1000;

async function runDispatchReminders() {
  const now = new Date();
  const windowDays = await getDispatchWindowDays();
  const gapCutoff = new Date(now.getTime() - MIN_GAP_MS);
  const notDueSince = { OR: [{ lastDispatchReminderAt: null }, { lastDispatchReminderAt: { lt: gapCutoff } }] };

  const orders = await prisma.order.findMany({
    where: {
      fulfilmentStatus: 'awaiting_dispatch',
      paymentStatus:    'held',
      disputeStatus:    'none',
      createdAt:        { lte: gapCutoff, gt: new Date(now.getTime() - windowDays * DAY_MS) },
      ...notDueSince,
    },
    select: { id: true, sellerId: true, createdAt: true, snapshotListingTitle: true, snapshotPhotos: true },
  });

  let sent = 0;
  for (const order of orders) {
    const deadline = new Date(order.createdAt.getTime() + windowDays * DAY_MS);
    const claimed = await prisma.order.updateMany({
      where: { id: order.id, fulfilmentStatus: 'awaiting_dispatch', ...notDueSince },
      data:  { lastDispatchReminderAt: now, dispatchReminderCount: { increment: 1 } },
    });
    if (!claimed.count) continue;
    try {
      await emailDispatchReminder(order, { daysLeft: Math.floor((deadline - now) / DAY_MS), deadline });
      sent++;
    } catch (err) {
      console.error(`[shippingDeadlines] reminder failed for order ${order.id}:`, err.message);
    }
  }
  if (orders.length) console.log(`[shippingDeadlines] dispatch reminders sent: ${sent}/${orders.length}`);
}

async function runOverdueCancellations() {
  const windowDays = await getDispatchWindowDays();
  const overdue = await prisma.order.findMany({
    where: {
      fulfilmentStatus: 'awaiting_dispatch',
      paymentStatus:    'held',
      disputeStatus:    'none',
      createdAt:        { lte: new Date(Date.now() - windowDays * DAY_MS) },
    },
    select: { id: true },
  });

  for (const { id } of overdue) {
    try {
      const cancelled = await cancelUnshippedOrder(id, `Not shipped within ${windowDays} days`);
      if (cancelled) console.log(`[shippingDeadlines] cancelled and refunded order ${id}`);
    } catch (err) {
      console.error(`[shippingDeadlines] could not cancel order ${id}:`, err.message);
    }
  }
}

async function runCollectionReminders() {
  const now = new Date();
  const orders = await prisma.order.findMany({
    where: {
      trackingStatus: 'awaiting_collection',
      fulfilmentStatus: { in: ['dispatched', 'delivered'] },
      collectionReminderSentAt: null,
      collectBy: { gt: now, lte: new Date(now.getTime() + DAY_MS) },
    },
    select: {
      id: true, buyerId: true, snapshotListingTitle: true, snapshotPhotos: true, trackingNumber: true,
      trackingUrl: true, collectionPointName: true, collectionPointAddress: true, collectBy: true,
    },
  });

  for (const order of orders) {
    const claimed = await prisma.order.updateMany({
      where: { id: order.id, collectionReminderSentAt: null },
      data:  { collectionReminderSentAt: now },
    });
    if (!claimed.count) continue;
    await emailCollectionReminder(order)
      .catch((err) => console.error(`[shippingDeadlines] collection reminder failed for ${order.id}:`, err.message));
  }
}

const safe = (name, fn) => () => fn().catch((err) => console.error(`[shippingDeadlines] ${name} failed:`, err.message));

function startShippingDeadlineJobs() {
  const opts = { timezone: 'Europe/London' };
  cron.schedule('0 9 * * *', safe('dispatch reminders', runDispatchReminders), opts);
  cron.schedule('15 * * * *', safe('overdue cancellations', runOverdueCancellations), opts);
  cron.schedule('30 * * * *', safe('collection reminders', runCollectionReminders), opts);
  console.log('[shippingDeadlines] Cron scheduled: reminders 09:00, cancellations + collection reminders hourly (Europe/London)');
}

module.exports = { startShippingDeadlineJobs, runDispatchReminders, runOverdueCancellations, runCollectionReminders };
