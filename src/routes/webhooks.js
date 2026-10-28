const express = require('express');
const stripe = require('../lib/stripe');
const prisma = require('../lib/prisma');
const checkoutService = require('../services/checkoutService');
const { notify } = require('../services/notificationService');

const router = express.Router();

// In-memory deduplication for events that have no related DB record yet.
// Long-lived process memory is sufficient; the DB check below covers restarts.
const _processedEventIds = new Set();

// ─── POST /webhooks/stripe ─────────────────────────────────────────────────────
// express.raw() is applied here (NOT express.json()) so Stripe can verify the
// HMAC signature against the raw bytes.
router.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('[webhook] Signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook error: ${err.message}` });
    }

    // Acknowledge immediately — Stripe requires 2xx within a few seconds.
    res.status(200).json({ received: true });

    // Process asynchronously after responding so we never timeout.
    handleEvent(event).catch((err) =>
      console.error(`[webhook] Unhandled error for event ${event.id}:`, err.message)
    );
  }
);

// ─── Event dispatcher ─────────────────────────────────────────────────────────
async function handleEvent(event) {
  // Global in-memory idempotency guard
  if (_processedEventIds.has(event.id)) {
    console.log(`[webhook] Duplicate (memory): ${event.id}`);
    return;
  }
  _processedEventIds.add(event.id);
  // Evict old IDs to avoid unbounded memory growth (keep last 5 000 events)
  if (_processedEventIds.size > 5000) {
    const [first] = _processedEventIds;
    _processedEventIds.delete(first);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      await onPaymentIntentSucceeded(event);
      break;
    case 'payment_intent.payment_failed':
      await onPaymentIntentFailed(event);
      break;
    case 'transfer.created':
      await onTransferCreated(event);
      break;
    case 'transfer.paid':
      await onTransferPaid(event);
      break;
    case 'charge.refunded':
      await onChargeRefunded(event);
      break;
    default:
      // Ignore event types we don't handle
      break;
  }
}

// ─── payment_intent.succeeded ─────────────────────────────────────────────────
// Fallback path: the /confirm endpoint is the primary order-creation path.
// This handler catches cases where the client never called /confirm (e.g. tab
// closed after payment).  Idempotent: skips if an order already exists.
async function onPaymentIntentSucceeded(event) {
  const pi = event.data.object;

  // DB-level idempotency: order already created via /confirm?
  const existing = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: pi.id },
  });
  if (existing) {
    appendWebhookEvent(existing.id, event.id, event.type);
    return;
  }

  // Reconstruct enough context from PI metadata to create the order
  const { checkout_session_id, buyer_id, seller_id, listing_id } = pi.metadata ?? {};
  if (!checkout_session_id || !buyer_id) {
    console.warn('[webhook] payment_intent.succeeded: missing metadata, skipping', pi.id);
    return;
  }

  try {
    await checkoutService.confirmOrder(checkout_session_id, buyer_id, pi.id);
    console.log('[webhook] payment_intent.succeeded: order created for PI', pi.id);
  } catch (err) {
    // LISTING_SOLD or SESSION_NOT_FOUND are expected races — log but don't retry
    console.warn('[webhook] confirmOrder via webhook failed:', err.message);
  }
}

// ─── payment_intent.payment_failed ───────────────────────────────────────────
async function onPaymentIntentFailed(event) {
  const pi = event.data.object;
  console.warn('[webhook] Payment failed for PI:', pi.id, pi.last_payment_error?.message);

  // If a payment record exists (unlikely at this stage), mark it failed
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: pi.id },
  });
  if (payment) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { paymentStatus: 'failed' },
    });
    appendWebhookEvent(payment.id, event.id, event.type);
  }
}

// ─── transfer.created ─────────────────────────────────────────────────────────
async function onTransferCreated(event) {
  const transfer = event.data.object;
  const sellerId = transfer.metadata?.seller_id;
  if (!sellerId) return;

  await prisma.payment.updateMany({
    where: { sellerId, payoutStatus: 'initiated', payoutInitiatedAt: { not: null } },
    data: { payoutStatus: 'initiated' }, // already set; no-op but confirms
  });

  console.log('[webhook] transfer.created:', transfer.id, 'seller:', sellerId);
}

// ─── transfer.paid ────────────────────────────────────────────────────────────
async function onTransferPaid(event) {
  const transfer = event.data.object;
  const sellerId = transfer.metadata?.seller_id;
  if (!sellerId) return;

  const now = new Date();

  const result = await prisma.payment.updateMany({
    where: { sellerId, payoutStatus: 'initiated' },
    data: { payoutStatus: 'completed', payoutCompletedAt: now },
  });

  if (result.count > 0) {
    notify(
      sellerId,
      'payout_completed',
      'Payout complete',
      `£${(transfer.amount / 100).toFixed(2)} has been sent to your bank account.`
    ).catch(() => {});
  }

  console.log('[webhook] transfer.paid:', transfer.id, 'updated', result.count, 'payments');
}

// ─── charge.refunded ──────────────────────────────────────────────────────────
async function onChargeRefunded(event) {
  const charge = event.data.object;
  const amountRefunded = charge.amount_refunded / 100; // pence → pounds

  const payment = await prisma.payment.findUnique({
    where: { stripeChargeId: charge.id },
  });
  if (!payment) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      amountRefunded,
      paymentStatus:  amountRefunded >= Number(payment.amountTotal) ? 'refunded' : 'partially_refunded',
      escrowStatus:   amountRefunded >= Number(payment.amountTotal) ? 'refunded' : 'partially_refunded',
    },
  });

  appendWebhookEvent(payment.id, event.id, event.type);
  console.log('[webhook] charge.refunded:', charge.id, 'amount:', amountRefunded);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
// Appends the Stripe event ID to payment.stripeWebhookEvents for audit trail.
async function appendWebhookEvent(paymentId, eventId, eventType) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      select: { stripeWebhookEvents: true },
    });
    if (!payment) return;

    const events = Array.isArray(payment.stripeWebhookEvents)
      ? payment.stripeWebhookEvents
      : [];
    events.push({ id: eventId, type: eventType, processedAt: new Date().toISOString() });

    await prisma.payment.update({
      where: { id: paymentId },
      data: { stripeWebhookEvents: events },
    });
  } catch (err) {
    console.error('[webhook] appendWebhookEvent failed:', err.message);
  }
}

module.exports = router;
