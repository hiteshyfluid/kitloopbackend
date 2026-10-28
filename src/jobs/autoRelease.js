const cron = require('node-cron');
const prisma = require('../lib/prisma');
const { releaseEscrow } = require('../services/orderService');
const { notify } = require('../services/notificationService');

// Runs every day at midnight UTC.
// Finds orders where the buyer's dispute window has expired with no active
// dispute, then releases escrow and marks the order completed.
const SCHEDULE = '0 0 * * *';

async function runAutoRelease() {
  console.log('[autoRelease] Starting escrow auto-release run');

  const now = new Date();

  const expiredOrders = await prisma.order.findMany({
    where: {
      fulfilmentStatus:       { in: ['dispatched', 'delivered'] },
      paymentStatus:          'held',
      disputeStatus:          'none',
      disputeWindowExpiresAt: { lte: now },
    },
    select: {
      id: true,
      sellerId: true,
      buyerId: true,
      snapshotListingTitle: true,
    },
  });

  if (!expiredOrders.length) {
    console.log('[autoRelease] No orders to release');
    return;
  }

  console.log(`[autoRelease] Releasing escrow for ${expiredOrders.length} order(s)`);

  let released = 0;
  let failed = 0;

  for (const order of expiredOrders) {
    try {
      await releaseEscrow(order.id);

      // Notify both parties
      await Promise.all([
        notify(
          order.buyerId,
          'delivered',
          'Order completed',
          `Your order for "${order.snapshotListingTitle}" has been completed. The dispute window has closed.`,
          order.id,
          'order'
        ),
        notify(
          order.sellerId,
          'payout_initiated',
          'Payout queued',
          `Payment for "${order.snapshotListingTitle}" is now queued for payout after the dispute window closed.`,
          order.id,
          'order'
        ),
      ]);

      console.log(`[autoRelease] Released: order ${order.id}`);
      released++;
    } catch (err) {
      console.error(`[autoRelease] Failed for order ${order.id}:`, err.message);
      failed++;
    }
  }

  console.log(
    `[autoRelease] Complete — released: ${released}, failed: ${failed}`
  );
}

function startAutoReleaseJob() {
  const job = cron.schedule(SCHEDULE, runAutoRelease, {
    timezone: 'UTC',
  });
  console.log('[autoRelease] Cron scheduled:', SCHEDULE);
  return job;
}

module.exports = { startAutoReleaseJob, runAutoRelease };
