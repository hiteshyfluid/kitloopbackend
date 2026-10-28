const cron       = require('node-cron');
const prisma     = require('../lib/prisma');
const { notify } = require('../services/notificationService');

// Runs every hour.
// Finds disputes that are 'open' and whose seller_response_deadline has passed.
// Escalates them to 'admin_reviewing' and notifies all admin users.
const SCHEDULE = '0 * * * *';

async function runDisputeEscalation() {
  console.log('[disputeEscalation] Starting run');
  const now = new Date();

  const overdue = await prisma.dispute.findMany({
    where: {
      status: 'open',
      sellerResponseDeadline: { lte: now },
    },
    select: {
      id: true,
      sellerId: true,
      buyerId: true,
      order: { select: { snapshotListingTitle: true } },
    },
  });

  if (!overdue.length) {
    console.log('[disputeEscalation] No overdue disputes found');
    return;
  }

  const admins = await prisma.user.findMany({
    where: { role: { in: ['admin', 'super_admin'] }, accountStatus: 'active' },
    select: { id: true },
  });

  let escalated = 0;
  let failed    = 0;

  for (const dispute of overdue) {
    try {
      await prisma.dispute.update({
        where: { id: dispute.id },
        data:  { status: 'admin_reviewing' },
      });

      const listingTitle = dispute.order?.snapshotListingTitle ?? 'an order';

      // Notify all admins
      await Promise.all(
        admins.map((a) =>
          notify(
            a.id,
            'dispute_raised',
            'Dispute escalated — seller did not respond',
            `Dispute ${dispute.id.slice(0, 8)} on "${listingTitle}" has been escalated for admin review.`,
            dispute.id,
            'dispute'
          )
        )
      );

      // Notify buyer that it's being reviewed
      notify(
        dispute.buyerId,
        'dispute_raised',
        'Your dispute is being reviewed',
        `The seller did not respond in time. Our team is now reviewing your dispute on "${listingTitle}".`,
        dispute.id,
        'dispute'
      ).catch(() => {});

      console.log(`[disputeEscalation] Escalated dispute ${dispute.id}`);
      escalated++;
    } catch (err) {
      console.error(`[disputeEscalation] Failed to escalate dispute ${dispute.id}:`, err.message);
      failed++;
    }
  }

  console.log(`[disputeEscalation] Complete — escalated: ${escalated}, failed: ${failed}`);
}

function startDisputeEscalationJob() {
  const job = cron.schedule(SCHEDULE, runDisputeEscalation, { timezone: 'UTC' });
  console.log('[disputeEscalation] Cron scheduled:', SCHEDULE);
  return job;
}

module.exports = { startDisputeEscalationJob, runDisputeEscalation };
