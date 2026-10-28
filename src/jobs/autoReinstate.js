'use strict';

const cron = require('node-cron');
const prisma = require('../lib/prisma');

async function runAutoReinstate() {
  const now = new Date();

  const suspended = await prisma.user.findMany({
    where: {
      accountStatus:     'suspended',
      suspensionEndDate: { lt: now },
    },
    select: { id: true, displayName: true, suspensionEndDate: true },
  });

  if (suspended.length === 0) return;

  for (const user of suspended) {
    try {
      await prisma.user.update({
        where: { id: user.id },
        data:  { accountStatus: 'active', suspensionEndDate: null, suspensionReason: null },
      });
      console.log(`[autoReinstate] Reinstated user ${user.id} (suspension ended ${user.suspensionEndDate?.toISOString()})`);
    } catch (err) {
      console.error(`[autoReinstate] Failed to reinstate user ${user.id}:`, err.message);
    }
  }

  console.log(`[autoReinstate] Completed — reinstated ${suspended.length} user(s)`);
}

function startAutoReinstateJob() {
  // Daily at 01:00 UTC
  cron.schedule('0 1 * * *', () => {
    console.log('[autoReinstate] Running daily reinstatement check…');
    runAutoReinstate().catch((err) =>
      console.error('[autoReinstate] Unhandled error:', err.message)
    );
  });
  console.log('[autoReinstate] Job scheduled (daily at 01:00 UTC)');
}

module.exports = { startAutoReinstateJob, runAutoReinstate };
