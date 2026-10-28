const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { getFeeValue } = require('./checkoutService');

// Pre-loved items are one-offs, and the whole cart is paid in one Stripe charge,
// so keep the cart a sensible size.
const MAX_CART_ITEMS = 10;

const CART_LISTING_SELECT = {
  id: true,
  title: true,
  price: true,
  shippingFee: true,
  condition: true,
  colour: true,
  photos: true,
  status: true,
  sellerId: true,
  seller: { select: { id: true, username: true, displayName: true, averageRating: true, reviewCount: true, accountStatus: true } },
  sport: { select: { id: true, name: true, slug: true } },
  subCategory: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
};

const money = (n) => Number(Number(n).toFixed(2));

function unavailableReason(listing, userId) {
  if (listing.sellerId === userId) return 'This is your own listing';
  if (listing.status === 'sold') return 'Sold';
  if (listing.status !== 'live') return 'No longer available';
  if (listing.seller?.accountStatus && listing.seller.accountStatus !== 'active') return 'Seller unavailable';
  return null;
}

// Totals use the same fee settings and per-item rounding as checkout, so the
// cart total matches the amount charged.
async function summarise(items) {
  const buyerProtectionPct = await getFeeValue('buyer_protection_fee_percentage');
  const available = items.filter((i) => i.isAvailable);
  const itemsTotal = available.reduce((t, i) => t + Number(i.listing.price), 0);
  const postageTotal = available.reduce((t, i) => t + Number(i.listing.shippingFee), 0);
  const buyerProtection = available.reduce((t, i) => t + money(Number(i.listing.price) * buyerProtectionPct), 0);
  return {
    count: items.length,
    availableCount: available.length,
    itemsTotal: money(itemsTotal),
    postageTotal: money(postageTotal),
    buyerProtectionTotal: money(buyerProtection),
    buyerProtectionPercentage: buyerProtectionPct,
    total: money(itemsTotal + postageTotal + buyerProtection),
  };
}

async function getCart(userId) {
  const rows = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, createdAt: true, listing: { select: CART_LISTING_SELECT } },
  });

  // Lets the cart offer "Move to favourites" without toggling an existing favourite off
  const favourites = rows.length
    ? await prisma.favourite.findMany({
        where: { userId, listingId: { in: rows.map((r) => r.listing.id) } },
        select: { listingId: true },
      })
    : [];
  const favouriteIds = new Set(favourites.map((f) => f.listingId));

  const items = rows.map((r) => {
    const reason = unavailableReason(r.listing, userId);
    const { accountStatus, ...seller } = r.listing.seller ?? {};
    return {
      id: r.id,
      addedAt: r.createdAt,
      isAvailable: !reason,
      unavailableReason: reason,
      isFavourited: favouriteIds.has(r.listing.id),
      listing: { ...r.listing, seller },
    };
  });

  return { items, summary: await summarise(items) };
}

async function addItem(userId, listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, status: true, sellerId: true, seller: { select: { accountStatus: true } } },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  if (listing.sellerId === userId) throw new AppError('You can’t add your own listing to your cart', 400, 'OWN_LISTING');
  if (listing.status !== 'live' || listing.seller?.accountStatus !== 'active') {
    throw new AppError('This item is no longer available', 409, 'LISTING_NOT_AVAILABLE');
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_listingId: { userId, listingId } },
    select: { id: true },
  });

  if (!existing) {
    const count = await prisma.cartItem.count({ where: { userId } });
    if (count >= MAX_CART_ITEMS) {
      throw new AppError(`Your cart can hold up to ${MAX_CART_ITEMS} items`, 400, 'CART_FULL');
    }
    await prisma.cartItem.create({ data: { userId, listingId } });
  }

  return getCart(userId);
}

async function removeItem(userId, listingId) {
  await prisma.cartItem.deleteMany({ where: { userId, listingId } });
  return getCart(userId);
}

async function clearCart(userId) {
  await prisma.cartItem.deleteMany({ where: { userId } });
  return getCart(userId);
}

module.exports = { getCart, addItem, removeItem, clearCart, MAX_CART_ITEMS, CART_LISTING_SELECT, unavailableReason };
