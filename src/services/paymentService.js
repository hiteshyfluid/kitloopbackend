const prisma = require('../lib/prisma');
const stripe = require('../lib/stripe');
const AppError = require('../utils/AppError');
const { notify } = require('./notificationService');

// A saved customer ID can stop existing in the current Stripe account (e.g. after
// switching between test/live keys or Stripe accounts). Treat that as "no customer".
function isMissingCustomer(err) {
  return err?.code === 'resource_missing' || /No such customer/i.test(err?.message ?? '');
}

async function stripeCustomerExists(customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    return !customer.deleted;
  } catch (err) {
    if (isMissingCustomer(err)) return false;
    throw err;
  }
}

// ─── Ensure the user has a valid Stripe customer ID ────────────────────────────
async function ensureStripeCustomer(user) {
  if (user.stripeCustomerId && await stripeCustomerExists(user.stripeCustomerId)) {
    return user.stripeCustomerId;
  }
  if (user.stripeCustomerId) {
    console.warn('[stripe] customer', user.stripeCustomerId, 'not found for user', user.id, '— creating a new one');
  }

  const customer = await stripe.customers.create({
    email: user.email,
    name: user.displayName || user.username,
    metadata: { user_id: user.id },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── getSellerBalance ─────────────────────────────────────────────────────────
async function getSellerBalance(sellerId) {
  const payments = await prisma.payment.findMany({
    where: { sellerId },
    select: {
      amountSellerPayout: true,
      escrowStatus: true,
      payoutStatus: true,
    },
  });

  let pendingRelease = 0;      // held in escrow, not yet available
  let availableForPayout = 0;  // released, not yet paid out
  let totalPaidOut = 0;        // completed payouts

  for (const p of payments) {
    const amount = Number(p.amountSellerPayout);
    if (p.escrowStatus === 'held') {
      pendingRelease += amount;
    } else if (p.escrowStatus === 'released') {
      if (p.payoutStatus === 'completed') {
        totalPaidOut += amount;
      } else {
        availableForPayout += amount;
      }
    }
  }

  return {
    pendingRelease: Number(pendingRelease.toFixed(2)),
    availableForPayout: Number(availableForPayout.toFixed(2)),
    totalPaidOut: Number(totalPaidOut.toFixed(2)),
    currency: 'GBP',
  };
}

// ─── getTransactionHistory ────────────────────────────────────────────────────
async function getTransactionHistory(sellerId, { page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { sellerId },
      select: {
        id: true,
        amountTotal: true,
        amountItem: true,
        amountSellerPayout: true,
        amountCommission: true,
        amountShipping: true,
        amountRefunded: true,
        currency: true,
        paymentMethod: true,
        paymentStatus: true,
        escrowStatus: true,
        payoutStatus: true,
        payoutInitiatedAt: true,
        payoutCompletedAt: true,
        createdAt: true,
        order: {
          select: {
            id: true,
            snapshotListingTitle: true,
            snapshotCondition: true,
            snapshotPhotos: true,
            fulfilmentStatus: true,
            buyer: { select: { id: true, username: true, displayName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.payment.count({ where: { sellerId } }),
  ]);

  return { payments, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── requestPayout ────────────────────────────────────────────────────────────
async function requestPayout(sellerId) {
  const seller = await prisma.user.findUnique({ where: { id: sellerId } });

  if (!seller.stripeConnectId) {
    throw new AppError(
      'Connect your bank account to receive payouts',
      400,
      'NO_STRIPE_CONNECT'
    );
  }

  // Find all released-but-unpaid payments for this seller
  const pending = await prisma.payment.findMany({
    where: {
      sellerId,
      escrowStatus: 'released',
      payoutStatus: { in: ['pending', null] },
    },
    select: { id: true, amountSellerPayout: true },
  });

  if (!pending.length) {
    throw new AppError('No funds available for payout', 400, 'NO_FUNDS');
  }

  const totalPence = Math.round(
    pending.reduce((sum, p) => sum + Number(p.amountSellerPayout), 0) * 100
  );

  if (totalPence < 100) {
    throw new AppError('Minimum payout is £1.00', 400, 'BELOW_MINIMUM');
  }

  const transfer = await stripe.transfers.create({
    amount: totalPence,
    currency: 'gbp',
    destination: seller.stripeConnectId,
    metadata: {
      seller_id: sellerId,
      payment_ids: pending.map((p) => p.id).join(','),
    },
  });

  const now = new Date();
  const ids = pending.map((p) => p.id);

  await prisma.payment.updateMany({
    where: { id: { in: ids } },
    data: {
      payoutStatus: 'initiated',
      payoutInitiatedAt: now,
    },
  });

  const payoutAmount = totalPence / 100;

  notify(
    sellerId,
    'payout_initiated',
    'Payout requested',
    `Your payout of £${payoutAmount.toFixed(2)} has been requested and is on its way to your bank account. This typically takes 1–3 business days.`,
    sellerId,
    'user'
  ).catch(() => {});

  return {
    transferId: transfer.id,
    amount: payoutAmount,
    currency: 'GBP',
    paymentCount: ids.length,
    initiatedAt: now,
  };
}

// ─── getSavedCards ────────────────────────────────────────────────────────────
async function getSavedCards(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user.stripeCustomerId) return { cards: [] };

  let methods;
  try {
    methods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });
  } catch (err) {
    // Stale customer from another Stripe account/mode — no usable saved cards
    if (isMissingCustomer(err)) return { cards: [] };
    throw err;
  }

  const cards = methods.data.map((pm) => ({
    id: pm.id,
    brand: pm.card.brand,
    last4: pm.card.last4,
    expMonth: pm.card.exp_month,
    expYear: pm.card.exp_year,
    country: pm.card.country,
  }));

  return { cards };
}

// ─── addCard ──────────────────────────────────────────────────────────────────
async function addCard(userId, stripePaymentMethodId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const customerId = await ensureStripeCustomer(user);

  const pm = await stripe.paymentMethods.attach(stripePaymentMethodId, {
    customer: customerId,
  });

  // Set as default
  await stripe.customers.update(customerId, {
    invoice_settings: { default_payment_method: pm.id },
  });

  return {
    id: pm.id,
    brand: pm.card.brand,
    last4: pm.card.last4,
    expMonth: pm.card.exp_month,
    expYear: pm.card.exp_year,
    country: pm.card.country,
  };
}

// ─── removeCard ───────────────────────────────────────────────────────────────
async function removeCard(userId, paymentMethodId) {
  // Verify the card belongs to this user's customer
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user.stripeCustomerId) {
    throw new AppError('No payment methods on file', 404, 'NOT_FOUND');
  }

  const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
  if (pm.customer !== user.stripeCustomerId) {
    throw new AppError('Payment method not found', 404, 'NOT_FOUND');
  }

  await stripe.paymentMethods.detach(paymentMethodId);
  return { removed: true };
}

// ─── addBankAccount ───────────────────────────────────────────────────────────
// Attaches a bank account token (created on the frontend via Stripe.js) to the
// user's Stripe customer, then stores masked details locally.
async function addBankAccount(userId, stripeBankAccountToken) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const customerId = await ensureStripeCustomer(user);

  const source = await stripe.customers.createSource(customerId, {
    source: stripeBankAccountToken,
  });

  // Store masked details
  const last4 = source.last4 ?? null;
  const routingNumber = source.routing_number ?? '';
  // UK sort code is stored in routing_number as "XXXXXX" (6 digits)
  const sortCodeMasked = routingNumber.length >= 4
    ? `**-**-${routingNumber.slice(-2)}`
    : null;

  await prisma.user.update({
    where: { id: userId },
    data: {
      bankAccountLast4:   last4,
      bankSortCodeMasked: sortCodeMasked,
    },
  });

  return {
    sourceId:       source.id,
    last4,
    sortCodeMasked,
  };
}

// ─── removeBankAccount ────────────────────────────────────────────────────────
async function removeBankAccount(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user.bankAccountLast4) {
    throw new AppError('No bank account on file', 404, 'NOT_FOUND');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { bankAccountLast4: null, bankSortCodeMasked: null },
  });

  return { removed: true };
}

module.exports = {
  ensureStripeCustomer,
  getSellerBalance,
  getTransactionHistory,
  requestPayout,
  getSavedCards,
  addCard,
  removeCard,
  addBankAccount,
  removeBankAccount,
};
