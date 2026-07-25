const prisma       = require('../lib/prisma');
const AppError     = require('../utils/AppError');
const { notify }   = require('./notificationService');
const { initiateCheckout } = require('./checkoutService');

const MSG_PAGE_SIZE       = 30;
const COUNTER_TTL_MS      = 24 * 60 * 60 * 1000;       // 24 hours
const PRICE_LOCK_MS       = 30 * 60 * 1000;             // 30 minutes

// ─── Shared selects ───────────────────────────────────────────────────────────

const OFFER_DETAIL_SELECT = {
  id: true,
  status: true,
  listingId: true,
  buyerId: true,
  sellerId: true,
  lastMessageAt: true,
  lastMessagePreview: true,
  buyerUnreadCount: true,
  sellerUnreadCount: true,
  listing: {
    select: {
      id: true,
      title: true,
      photos: true,
      condition: true,
      price: true,
      status: true,
    },
  },
  buyer:  { select: { id: true, username: true, displayName: true, avatarUrl: true } },
  seller: { select: { id: true, username: true, displayName: true, avatarUrl: true, accountStatus: true } },
};

const MSG_SELECT = {
  id: true,
  offerId: true,
  senderId: true,
  messageType: true,
  body: true,
  offerAmount: true,
  isRead: true,
  createdAt: true,
  counterOffer: {
    select: {
      id: true,
      counterAmount: true,
      originalPrice: true,
      status: true,
      expiresAt: true,
      acceptedAt: true,
      declinedAt: true,
      checkoutPriceLockExpiresAt: true,
    },
  },
};

// ─── Preview helper ───────────────────────────────────────────────────────────

function makePreview(messageType, body, amount) {
  if (messageType === 'offer')         return `Offered £${Number(amount).toFixed(2)}`;
  if (messageType === 'counter_offer') return `Counter offer: £${Number(amount).toFixed(2)}`;
  return (body ?? '').slice(0, 60);
}

// ─── 1. getOrCreateThread ─────────────────────────────────────────────────────

async function getOrCreateThread(listingId, buyerId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { seller: { select: { id: true, accountStatus: true } } },
  });

  if (!listing || !['live', 'reserved'].includes(listing.status)) {
    throw new AppError('This item is no longer available', 410, 'LISTING_UNAVAILABLE');
  }
  if (listing.sellerId === buyerId) {
    throw new AppError('You cannot make an offer on your own listing', 403, 'OWN_LISTING');
  }
  if (listing.seller.accountStatus !== 'active') {
    throw new AppError('This seller is currently unavailable', 403, 'SELLER_SUSPENDED');
  }

  const existing = await prisma.offer.findUnique({
    where: { listingId_buyerId: { listingId, buyerId } },
    select: OFFER_DETAIL_SELECT,
  });

  if (existing) return { offer: existing, isNewThread: false };

  const created = await prisma.offer.create({
    data: { listingId, buyerId, sellerId: listing.sellerId },
    select: OFFER_DETAIL_SELECT,
  });

  return { offer: created, isNewThread: true };
}

// ─── 2. getMyThreads ─────────────────────────────────────────────────────────

async function getMyThreads(userId, { page = 1, pageSize = 20, unreadOnly = false } = {}) {
  const skip = (page - 1) * pageSize;

  const unreadFilter = unreadOnly
    ? {
        OR: [
          { buyerId: userId,  buyerUnreadCount:  { gt: 0 } },
          { sellerId: userId, sellerUnreadCount: { gt: 0 } },
        ],
      }
    : { OR: [{ buyerId: userId }, { sellerId: userId }] };

  const [offers, total] = await Promise.all([
    prisma.offer.findMany({
      where: unreadFilter,
      select: OFFER_DETAIL_SELECT,
      orderBy: { lastMessageAt: { sort: 'desc', nulls: 'last' } },
      skip,
      take: pageSize,
    }),
    prisma.offer.count({ where: unreadFilter }),
  ]);

  // Shape each thread: resolve other_party and unread_count relative to this user
  const threads = offers.map((offer) => {
    const isBuyer = offer.buyerId === userId;
    const listing = offer.listing;
    return {
      id: offer.id,
      status: offer.status,
      listing: {
        id:        listing.id,
        title:     listing.title,
        photo:     (listing.photos ?? [])[0] ?? null,
        condition: listing.condition,
        price:     listing.price,
      },
      otherParty: isBuyer
        ? { id: offer.seller.id, username: offer.seller.username, displayName: offer.seller.displayName }
        : { id: offer.buyer.id,  username: offer.buyer.username,  displayName: offer.buyer.displayName  },
      lastMessagePreview: offer.lastMessagePreview,
      lastMessageAt:      offer.lastMessageAt,
      unreadCount:        isBuyer ? offer.buyerUnreadCount : offer.sellerUnreadCount,
    };
  });

  return { threads, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// ─── 3. getThreadDetail ───────────────────────────────────────────────────────

async function getThreadDetail(offerId, userId) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: OFFER_DETAIL_SELECT,
  });

  if (!offer) throw new AppError('Thread not found', 404, 'NOT_FOUND');
  if (offer.buyerId !== userId && offer.sellerId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  // Mark messages as read + reset caller's unread count (side-effect of opening a thread)
  const isBuyer = offer.buyerId === userId;
  await Promise.all([
    prisma.message.updateMany({
      where: { offerId, senderId: { not: userId } },
      data: { isRead: true },
    }),
    prisma.offer.update({
      where: { id: offerId },
      data: isBuyer ? { buyerUnreadCount: 0 } : { sellerUnreadCount: 0 },
    }),
  ]);

  return offer;
}

// ─── 4. getMessages ───────────────────────────────────────────────────────────

async function getMessages(offerId, userId, before = null) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    select: { id: true, buyerId: true, sellerId: true },
  });

  if (!offer) throw new AppError('Thread not found', 404, 'NOT_FOUND');
  if (offer.buyerId !== userId && offer.sellerId !== userId) {
    throw new AppError('Forbidden', 403, 'FORBIDDEN');
  }

  let cursorDate = null;
  if (before) {
    const ref = await prisma.message.findUnique({ where: { id: before }, select: { createdAt: true } });
    if (ref) cursorDate = ref.createdAt;
  }

  const raw = await prisma.message.findMany({
    where: {
      offerId,
      ...(cursorDate ? { createdAt: { lt: cursorDate } } : {}),
    },
    select: MSG_SELECT,
    orderBy: { createdAt: 'desc' },
    take: MSG_PAGE_SIZE + 1,
  });

  const hasMore = raw.length > MSG_PAGE_SIZE;
  const messages = raw.slice(0, MSG_PAGE_SIZE).reverse(); // ascending for display

  return { messages, hasMore };
}

// ─── 5. sendMessage ───────────────────────────────────────────────────────────

async function sendMessage(offerId, senderId, body, offerAmount) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      listing: { select: { id: true, status: true, title: true } },
      seller:  { select: { id: true, accountStatus: true } },
      buyer:   { select: { id: true, accountStatus: true } },
    },
  });

  if (!offer) throw new AppError('Thread not found', 404, 'NOT_FOUND');
  const isBuyer  = offer.buyerId  === senderId;
  const isSeller = offer.sellerId === senderId;
  if (!isBuyer && !isSeller) throw new AppError('Forbidden', 403, 'FORBIDDEN');

  if (offer.status !== 'active') {
    throw new AppError('This thread is no longer active', 409, 'THREAD_CLOSED');
  }

  // Check listing is still live when sending an offer amount
  if (offerAmount && offer.listing.status !== 'live') {
    throw new AppError('This item is no longer available', 410, 'LISTING_SOLD');
  }

  // Validate the other party hasn't been suspended (no messaging into frozen threads)
  const otherParty = isBuyer ? offer.seller : offer.buyer;
  if (otherParty.accountStatus !== 'active') {
    throw new AppError('This seller is currently unavailable', 403, 'SELLER_SUSPENDED');
  }

  const messageType = offerAmount ? 'offer' : 'text';
  const preview     = makePreview(messageType, body, offerAmount);
  const now         = new Date();

  const [message] = await prisma.$transaction([
    prisma.message.create({
      data: {
        offerId,
        senderId,
        messageType,
        body:        body ?? null,
        offerAmount: offerAmount ?? null,
      },
      select: MSG_SELECT,
    }),
    prisma.offer.update({
      where: { id: offerId },
      data: {
        lastMessageAt:      now,
        lastMessagePreview: preview,
        // Reset sender's unread to 0, increment recipient's count
        ...(isBuyer
          ? { buyerUnreadCount: 0, sellerUnreadCount: { increment: 1 } }
          : { sellerUnreadCount: 0, buyerUnreadCount: { increment: 1 } }
        ),
      },
    }),
  ]);

  // Notify only for offer-type messages (not every plain text — per SRS)
  if (messageType === 'offer') {
    notify(
      offer.sellerId,
      'offer_received',
      'New offer received',
      `You have a new offer of £${Number(offerAmount).toFixed(2)} on "${offer.listing.title}"`,
      offerId,
      'offer'
    ).catch((e) => console.error('[notify] offer_received:', e.message));
  }

  return message;
}

// ─── 6. sendCounterOffer ──────────────────────────────────────────────────────

async function sendCounterOffer(offerId, sellerId, counterAmount, message) {
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      listing: { select: { id: true, title: true, price: true, status: true } },
    },
  });

  if (!offer) throw new AppError('Thread not found', 404, 'NOT_FOUND');
  if (offer.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'NOT_THREAD_SELLER');

  if (!['live', 'reserved'].includes(offer.listing.status)) {
    throw new AppError('This item is no longer available', 410, 'LISTING_UNAVAILABLE');
  }

  const listingPrice = Number(offer.listing.price);
  if (Number(counterAmount) > listingPrice) {
    throw new AppError(
      `Counter offer cannot exceed your listed price of £${listingPrice.toFixed(2)}`,
      400,
      'EXCEEDS_LISTED_PRICE'
    );
  }

  // App-level check first (DB constraint is the final race-condition guard)
  const existing = await prisma.counterOffer.findFirst({
    where: { offerId, status: 'pending' },
  });
  if (existing) {
    throw new AppError(
      'You have a pending counter offer — wait for a response before sending another',
      409,
      'PENDING_COUNTER_EXISTS'
    );
  }

  const now       = new Date();
  const expiresAt = new Date(now.getTime() + COUNTER_TTL_MS);
  const preview   = makePreview('counter_offer', message, counterAmount);

  // Interactive transaction: message first so we get its id for counter_offer.messageId
  const counterOffer = await prisma.$transaction(async (tx) => {
    const msg = await tx.message.create({
      data: {
        offerId,
        senderId:    sellerId,
        messageType: 'counter_offer',
        body:        message ?? null,
        offerAmount: counterAmount,
      },
      select: { id: true, createdAt: true },
    });

    const co = await tx.counterOffer.create({
      data: {
        offerId,
        messageId:     msg.id,
        sellerId,
        buyerId:       offer.buyerId,
        listingId:     offer.listingId,
        counterAmount,
        originalPrice: listingPrice,
        expiresAt,
      },
    });

    await tx.offer.update({
      where: { id: offerId },
      data: {
        lastMessageAt:      msg.createdAt,
        lastMessagePreview: preview,
        sellerUnreadCount:  0,
        buyerUnreadCount:   { increment: 1 },
      },
    });

    return co;
  }).catch((err) => {
    // Partial unique index violation → pending counter already exists
    if (err.code === 'P2002') {
      throw new AppError(
        'You have a pending counter offer — wait for a response before sending another',
        409,
        'PENDING_COUNTER_EXISTS'
      );
    }
    throw err;
  });

  notify(
    offer.buyerId,
    'counter_offer_received',
    'Counter offer received',
    `The seller has made a counter offer of £${Number(counterAmount).toFixed(2)} on "${offer.listing.title}"`,
    counterOffer.id,
    'counter_offer'
  ).catch((e) => console.error('[notify] counter_offer_received:', e.message));

  return counterOffer;
}

// ─── 7. acceptCounterOffer ────────────────────────────────────────────────────

async function acceptCounterOffer(counterOfferId, buyerId) {
  const co = await prisma.counterOffer.findUnique({
    where: { id: counterOfferId },
    include: {
      offer:   { select: { id: true } },
      listing: { select: { id: true, status: true, title: true } },
      seller:  { select: { id: true, displayName: true } },
    },
  });

  if (!co) throw new AppError('Counter offer not found', 404, 'NOT_FOUND');
  if (co.buyerId !== buyerId) throw new AppError('Forbidden', 403, 'NOT_COUNTER_OFFER_BUYER');

  if (co.status !== 'pending') {
    if (co.status === 'expired') {
      throw new AppError('This counter offer has expired', 410, 'COUNTER_OFFER_EXPIRED');
    }
    throw new AppError(`Counter offer is already ${co.status}`, 409, 'NOT_PENDING');
  }

  if (co.expiresAt < new Date()) {
    // Mark expired in DB for consistency then throw
    await prisma.counterOffer.update({ where: { id: counterOfferId }, data: { status: 'expired' } });
    throw new AppError('This counter offer has expired', 410, 'COUNTER_OFFER_EXPIRED');
  }

  if (!['live', 'reserved'].includes(co.listing.status)) {
    throw new AppError('This item is no longer available', 410, 'LISTING_UNAVAILABLE');
  }

  const now             = new Date();
  const priceLockExpiry = new Date(now.getTime() + PRICE_LOCK_MS);

  // Update counter offer status to accepted first (checkoutService validates status==='accepted')
  await prisma.counterOffer.update({
    where: { id: counterOfferId },
    data: {
      status:                   'accepted',
      acceptedAt:               now,
      checkoutPriceLockExpiresAt: priceLockExpiry,
    },
  });

  // Initiate a price-locked checkout session
  const checkoutSession = await initiateCheckout(co.listingId, buyerId, counterOfferId);

  notify(
    co.sellerId,
    'counter_offer_accepted',
    'Counter offer accepted!',
    `${co.seller.displayName ?? 'A buyer'} accepted your counter offer of £${Number(co.counterAmount).toFixed(2)} on "${co.listing.title}". They are now completing checkout.`,
    counterOfferId,
    'counter_offer'
  ).catch((e) => console.error('[notify] counter_offer_accepted:', e.message));

  return {
    counterOffer:     { id: co.id, status: 'accepted' },
    checkoutSessionId: checkoutSession.id,
    redirectTo:        `/checkout/${co.listingId}?counter_offer_id=${counterOfferId}`,
  };
}

// ─── 8. declineCounterOffer ───────────────────────────────────────────────────

async function declineCounterOffer(counterOfferId, buyerId) {
  const co = await prisma.counterOffer.findUnique({
    where: { id: counterOfferId },
    include: { listing: { select: { title: true } } },
  });

  if (!co) throw new AppError('Counter offer not found', 404, 'NOT_FOUND');
  if (co.buyerId !== buyerId) throw new AppError('Forbidden', 403, 'NOT_COUNTER_OFFER_BUYER');

  if (co.status !== 'pending') {
    throw new AppError(`Counter offer is already ${co.status} — cannot decline`, 409, 'NOT_PENDING');
  }

  const updated = await prisma.counterOffer.update({
    where: { id: counterOfferId },
    data: { status: 'declined', declinedAt: new Date() },
    select: { id: true, status: true },
  });

  notify(
    co.sellerId,
    'counter_offer_declined',
    'Counter offer declined',
    `Your counter offer of £${Number(co.counterAmount).toFixed(2)} on "${co.listing.title}" was declined.`,
    counterOfferId,
    'counter_offer'
  ).catch((e) => console.error('[notify] counter_offer_declined:', e.message));

  return updated;
}

module.exports = {
  getOrCreateThread,
  getMyThreads,
  getThreadDetail,
  getMessages,
  sendMessage,
  sendCounterOffer,
  acceptCounterOffer,
  declineCounterOffer,
};
