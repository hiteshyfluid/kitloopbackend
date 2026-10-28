const cron           = require('node-cron');
const prisma         = require('../lib/prisma');
const { notify }     = require('../services/notificationService');

// Runs every hour. Two passes:
//   1. Pending counters whose 24-hr window has elapsed → 'expired'
//   2. Accepted counters whose 30-min checkout price lock has elapsed → 'unavailable'
//      (buyer accepted but never completed checkout in time)
const SCHEDULE = '0 * * * *';

async function runCounterOfferExpiry() {
  console.log('[counterOfferExpiry] Starting run');
  const now = new Date();

  // ── Pass 1: expire pending counters ────────────────────────────────────────
  const expiredCounters = await prisma.counterOffer.findMany({
    where: {
      status:    'pending',
      expiresAt: { lte: now },
    },
    select: {
      id: true,
      sellerId: true,
      counterAmount: true,
      listing: { select: { title: true } },
    },
  });

  let expired = 0;
  let failedExpiry = 0;

  for (const co of expiredCounters) {
    try {
      await prisma.counterOffer.update({
        where: { id: co.id },
        data:  { status: 'expired' },
      });

      notify(
        co.sellerId,
        'counter_offer_declined',  // closest available type — no 'counter_offer_expired'
        'Counter offer expired',
        `Your counter offer of £${Number(co.counterAmount).toFixed(2)} on "${co.listing.title}" expired without a response.`,
        co.id,
        'counter_offer'
      ).catch((e) => console.error('[counterOfferExpiry] notify failed:', e.message));

      console.log(`[counterOfferExpiry] Expired counter offer ${co.id}`);
      expired++;
    } catch (err) {
      console.error(`[counterOfferExpiry] Failed to expire ${co.id}:`, err.message);
      failedExpiry++;
    }
  }

  // ── Pass 2: mark accepted-but-abandoned counters as unavailable ─────────────
  // Buyer accepted but didn't complete checkout within the 30-min price lock.
  const abandonedCounters = await prisma.counterOffer.findMany({
    where: {
      status:                    'accepted',
      checkoutPriceLockExpiresAt: { lte: now },
    },
    select: { id: true },
  });

  let abandoned = 0;
  if (abandonedCounters.length) {
    await prisma.counterOffer.updateMany({
      where: { id: { in: abandonedCounters.map(c => c.id) } },
      data:  { status: 'unavailable' },
    });
    abandoned = abandonedCounters.length;
  }

  console.log(
    `[counterOfferExpiry] Complete — expired: ${expired}, failed: ${failedExpiry}, abandoned: ${abandoned}`
  );
}

function startCounterOfferExpiryJob() {
  const job = cron.schedule(SCHEDULE, runCounterOfferExpiry, { timezone: 'UTC' });
  console.log('[counterOfferExpiry] Cron scheduled:', SCHEDULE);
  return job;
}

module.exports = { startCounterOfferExpiryJob, runCounterOfferExpiry };
