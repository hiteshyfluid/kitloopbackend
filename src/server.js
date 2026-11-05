const app = require('./app');
const prisma = require('./lib/prisma');
const { startAutoReleaseJob }          = require('./jobs/autoRelease');
const { startCounterOfferExpiryJob }   = require('./jobs/counterOfferExpiry');
const { startDisputeEscalationJob }    = require('./jobs/disputeEscalation');
const { startAutoReinstateJob }        = require('./jobs/autoReinstate');

const PORT = process.env.PORT || 3000;

// ─── Crash guards ─────────────────────────────────────────────────────────────
// A stray rejected promise (fire-and-forget email, notification, cron run) or a
// driver error emitted outside a request must never take the whole API down.
// Log it loudly and keep serving.
process.on('unhandledRejection', (reason) => {
  console.error('[process] Unhandled promise rejection:', reason instanceof Error ? reason.stack : reason);
});

process.on('uncaughtException', (err) => {
  console.error('[process] Uncaught exception:', err.stack || err);
});

const server = app.listen(PORT, () => {
  console.log(`The Kit Loop API running on port ${PORT}`);
  prisma.connectWithRetry();
  startAutoReleaseJob();
  startCounterOfferExpiryJob();
  startDisputeEscalationJob();
  startAutoReinstateJob();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[server] Port ${PORT} is already in use — stop the other process or change PORT.`);
    process.exit(1);
  }
  console.error('[server] Error:', err.stack || err);
});

// Slow mobile uploads (photos/video) need more than Node's defaults; keep-alive
// must outlive common proxy idle timeouts so connections aren't reset mid-request.
server.requestTimeout = 5 * 60 * 1000;
server.keepAliveTimeout = 65 * 1000;
server.headersTimeout = 66 * 1000;

// ─── Graceful shutdown ────────────────────────────────────────────────────────
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[server] ${signal} received — closing connections`);
  server.close(async () => {
    await prisma.$disconnect().catch(() => {});
    process.exit(0);
  });
  // Don't hang forever on a stuck keep-alive connection
  setTimeout(() => process.exit(0), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
