const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { generateOgImage } = require('./cloudinaryService');
const { textSearchWhere } = require('./searchService');

// ─── View-count deduplication cache ───────────────────────────────────────────
// Prevents counting more than one view per user/IP per listing per hour.
const viewCache = new Map();
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  for (const [key, ts] of viewCache) {
    if (ts < oneHourAgo) viewCache.delete(key);
  }
}, 5 * 60 * 1000).unref();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ─── Shipping fee lookup ───────────────────────────────────────────────────────
const SHIPPING_FEE_DEFAULTS = { small: 3.49, medium: 5.49, large: 8.99, oversized: 14.99 };

async function getShippingFee(parcelSize) {
  const config = await prisma.feeConfig.findUnique({
    where: { configKey: `shipping_fee_${parcelSize}` },
  });
  return config ? Number(config.configValue) : (SHIPPING_FEE_DEFAULTS[parcelSize] ?? 0);
}

// ─── Shared select shapes ─────────────────────────────────────────────────────
const SELLER_CARD_SELECT = {
  id: true,
  username: true,
  displayName: true,
  avatarUrl: true,
  verifiedSeller: true,
  averageRating: true,
};

const SELLER_DETAIL_SELECT = {
  ...SELLER_CARD_SELECT,
  reviewCount: true,
  totalSales: true,
  createdAt: true,
};

const LISTING_CARD_SELECT = {
  id: true,
  title: true,
  price: true,
  shippingFee: true,
  condition: true,
  colour: true,
  parcelSize: true,
  photos: true,
  status: true,
  isFeatured: true,
  publishedAt: true,
  wishlistCount: true,
  seller: { select: SELLER_CARD_SELECT },
  sport: { select: { id: true, name: true, slug: true } },
  subCategory: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
};

// ─── 1. createListing ─────────────────────────────────────────────────────────
async function createListing(sellerId, data) {
  const { title, description, sportId, subCategoryId, brandId, condition, colour, price, parcelSize, photos, videoUrl } = data;

  const shippingFee = await getShippingFee(parcelSize);

  return prisma.listing.create({
    data: {
      sellerId,
      title,
      description,
      sportId,
      subCategoryId,
      brandId,
      condition,
      colour,
      price,
      parcelSize,
      shippingFee,
      photos,
      videoUrl: videoUrl || null,
      status: 'draft',
    },
    select: {
      id: true,
      status: true,
      shippingFee: true,
      createdAt: true,
    },
  });
}

// ─── 2. publishListing ────────────────────────────────────────────────────────
async function publishListing(listingId, sellerId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true, photos: true },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  if (listing.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (listing.status !== 'draft') throw new AppError('Only draft listings can be published', 400, 'INVALID_STATUS');

  const seller = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { holidayMode: true },
  });

  const newStatus = seller.holidayMode ? 'paused' : 'live';
  const photos = Array.isArray(listing.photos) ? listing.photos : [];
  const ogImageUrl = photos.length > 0 ? generateOgImage(photos[0]) : null;

  return prisma.listing.update({
    where: { id: listingId },
    data: { status: newStatus, publishedAt: new Date(), ogImageUrl },
    select: { id: true, status: true, publishedAt: true, ogImageUrl: true },
  });
}

// ─── 3. getListing ────────────────────────────────────────────────────────────
async function getListing(listingId, requestingUserId, requestIp) {
  // A malformed id can never match — answer 404 rather than letting Prisma throw a 500
  if (!UUID_RE.test(listingId)) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      description: true,
      price: true,
      shippingFee: true,
      condition: true,
      colour: true,
      parcelSize: true,
      photos: true,
      videoUrl: true,
      status: true,
      flagReason: true,
      viewCount: true,
      wishlistCount: true,
      shareCount: true,
      isFeatured: true,
      ogImageUrl: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      sellerId: true,
      seller: { select: SELLER_DETAIL_SELECT },
      sport: { select: { id: true, name: true, slug: true } },
      subCategory: { select: { id: true, name: true, slug: true, recommendedParcelSize: true, isOversized: true } },
      brand: { select: { id: true, name: true, slug: true, logoUrl: true } },
    },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');

  const isOwnListing = listing.sellerId === requestingUserId;
  const isPubliclyVisible = listing.status === 'live';

  // Drafts are only visible to the seller
  if (listing.status === 'draft' && !isOwnListing) {
    throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  }

  // Sold/removed/paused/flagged — return minimal data with 410 status
  if (!isPubliclyVisible && !isOwnListing) {
    return {
      statusCode: 410,
      listing: {
        id: listing.id,
        title: listing.title,
        status: listing.status,
        primaryPhoto: Array.isArray(listing.photos) ? listing.photos[0] ?? null : null,
      },
    };
  }

  // Increment view count — max once per user/IP per hour
  const viewKey = `${listingId}:${requestingUserId || requestIp}`;
  const lastViewed = viewCache.get(viewKey);
  if (!lastViewed || Date.now() - lastViewed > 60 * 60 * 1000) {
    viewCache.set(viewKey, Date.now());
    prisma.listing.update({ where: { id: listingId }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  }

  // Check if requesting user has favourited this listing
  let isFavourited = false;
  if (requestingUserId && !isOwnListing) {
    const fav = await prisma.favourite.findUnique({
      where: { userId_listingId: { userId: requestingUserId, listingId } },
      select: { id: true },
    });
    isFavourited = !!fav;
  }

  const { sellerId, ...listingData } = listing;
  return { statusCode: 200, listing: { ...listingData, isFavourited } };
}

// ─── 4. searchListings ────────────────────────────────────────────────────────
async function searchListings(filters) {
  const { q, sport, sub_category, seller, condition, brand, colour, price_min, price_max, sort, featured, page, page_size } = filters;

  const where = { status: 'live' };

  if (seller) where.sellerId = seller;

  if (q) {
    Object.assign(where, textSearchWhere(q));
  }

  if (sport) {
    const slugs = sport.split(',').map((s) => s.trim()).filter(Boolean);
    if (slugs.length) where.sport = { slug: { in: slugs } };
  }

  if (sub_category) {
    where.subCategory = { slug: sub_category.trim() };
  }

  if (condition) {
    const conditions = condition.split(',').map((c) => c.trim()).filter(Boolean);
    if (conditions.length) where.condition = { in: conditions };
  }

  if (brand) {
    const slugs = brand.split(',').map((b) => b.trim()).filter(Boolean);
    if (slugs.length) where.brand = { slug: { in: slugs } };
  }

  if (colour) {
    const colours = colour.split(',').map((c) => c.trim()).filter(Boolean);
    if (colours.length) where.colour = { in: colours };
  }

  if (price_min !== undefined || price_max !== undefined) {
    where.price = {};
    if (price_min !== undefined) where.price.gte = price_min;
    if (price_max !== undefined) where.price.lte = price_max;
  }

  if (featured === 'true') where.isFeatured = true;

  const ORDER_MAP = {
    newest: { publishedAt: 'desc' },
    oldest: { publishedAt: 'asc' },
    price_asc: { price: 'asc' },
    price_desc: { price: 'desc' },
  };
  const orderBy = ORDER_MAP[sort] || ORDER_MAP.newest;

  const skip = (page - 1) * page_size;

  const [listings, total, brandRows, colourRows] = await Promise.all([
    prisma.listing.findMany({ where, orderBy, skip, take: page_size, select: LISTING_CARD_SELECT }),
    prisma.listing.count({ where }),
    prisma.listing.findMany({
      where,
      select: { brandId: true, brand: { select: { id: true, name: true, slug: true, logoUrl: true } } },
      distinct: ['brandId'],
      orderBy: { brand: { name: 'asc' } },
    }),
    prisma.listing.findMany({
      where,
      select: { colour: true },
      distinct: ['colour'],
      orderBy: { colour: 'asc' },
    }),
  ]);

  return {
    listings,
    pagination: {
      page,
      pageSize: page_size,
      totalResults: total,
      totalPages: Math.ceil(total / page_size),
    },
    availableFilters: {
      brands: brandRows.map((r) => r.brand).filter(Boolean),
      colours: colourRows.map((r) => r.colour),
    },
  };
}

const FEATURED_LISTINGS_LIMIT = 8;

// ─── 5. getHomepageData ───────────────────────────────────────────────────────
async function getHomepageData(userId) {
  const liveActiveSeller = { status: 'live', seller: { accountStatus: 'active' } };

  const [sports, featuredListings, user, heroSetting] = await Promise.all([
    prisma.sport.findMany({
      where: { status: 'active' },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true, iconUrl: true, listingCount: true, seasonalHighlight: true },
    }),
    prisma.listing.findMany({
      where: { ...liveActiveSeller, isFeatured: true },
      orderBy: { featuredAt: 'desc' },
      take: FEATURED_LISTINGS_LIMIT,
      select: LISTING_CARD_SELECT,
    }),
    userId
      ? prisma.user.findUnique({ where: { id: userId }, select: { preferredSports: true } })
      : Promise.resolve(null),
    prisma.siteSetting.findUnique({ where: { settingKey: 'homepage_hero_image_url' } }),
  ]);

  let orderedSports = sports;
  if (user?.preferredSports && Array.isArray(user.preferredSports) && user.preferredSports.length) {
    const preferred = new Set(user.preferredSports);
    orderedSports = [
      ...sports.filter((s) => preferred.has(s.id)),
      ...sports.filter((s) => !preferred.has(s.id)),
    ];
  }

  // No admin-curated featured listings — fall back to the most recently
  // published live listings under a "Latest Listings" heading.
  let displayListings = featuredListings;
  let featuredListingsTitle = 'Featured Listings';
  if (displayListings.length === 0) {
    displayListings = await prisma.listing.findMany({
      where: liveActiveSeller,
      orderBy: { publishedAt: 'desc' },
      take: FEATURED_LISTINGS_LIMIT,
      select: LISTING_CARD_SELECT,
    });
    featuredListingsTitle = 'Latest Listings';
  }

  return {
    sports: orderedSports,
    featuredListings: displayListings,
    featuredListingsTitle,
    heroImageUrl: heroSetting?.settingValue ?? null,
  };
}

// ─── 6. updateListing ────────────────────────────────────────────────────────
async function updateListing(listingId, sellerId, data) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true, parcelSize: true, sportId: true },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  if (listing.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (listing.status === 'flagged') throw new AppError('Flagged listings cannot be edited', 403, 'LISTING_FLAGGED');
  if (listing.status === 'removed') throw new AppError('Removed listings cannot be edited', 403, 'LISTING_REMOVED');
  // Per the API spec only sold listings are locked; order snapshots are never touched here.
  if (listing.status === 'sold') throw new AppError('Sold listings cannot be edited', 409, 'LISTING_SOLD');

  const { title, description, condition, colour, price, parcelSize, photos, videoUrl, sportId, subCategoryId, brandId } = data;
  const updateData = {};

  // Category changes: the sub-category must belong to the (new or current) sport
  if (sportId !== undefined || subCategoryId !== undefined) {
    if (sportId !== undefined && subCategoryId === undefined) {
      throw new AppError('Choose a category for the new sport', 400, 'SUB_CATEGORY_REQUIRED');
    }
    const targetSportId = sportId ?? listing.sportId;
    const subCategory = await prisma.subCategory.findFirst({
      where: { id: subCategoryId, sportId: targetSportId, status: 'active' },
      select: { id: true },
    });
    if (!subCategory) throw new AppError('That category does not belong to the selected sport', 400, 'INVALID_SUB_CATEGORY');
    if (sportId !== undefined) updateData.sportId = sportId;
    updateData.subCategoryId = subCategoryId;
  }

  if (brandId !== undefined) {
    const brand = await prisma.brand.findFirst({ where: { id: brandId, status: 'active' }, select: { id: true } });
    if (!brand) throw new AppError('Brand not found', 400, 'INVALID_BRAND');
    updateData.brandId = brandId;
  }

  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (condition !== undefined) updateData.condition = condition;
  if (colour !== undefined) updateData.colour = colour;
  if (price !== undefined) updateData.price = price;
  if (photos !== undefined) {
    updateData.photos = photos;
    // Keep the share image in step with the cover photo once a listing is published
    if (listing.status !== 'draft' && photos.length) updateData.ogImageUrl = generateOgImage(photos[0]);
  }
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl ?? null;

  if (parcelSize !== undefined) {
    updateData.parcelSize = parcelSize;
    if (parcelSize !== listing.parcelSize) {
      updateData.shippingFee = await getShippingFee(parcelSize);
    }
  }

  return prisma.listing.update({
    where: { id: listingId },
    data: updateData,
    select: { id: true, updatedAt: true, status: true, shippingFee: true },
  });
}

// ─── 7. deleteListing ────────────────────────────────────────────────────────
async function deleteListing(listingId, sellerId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  if (listing.sellerId !== sellerId) throw new AppError('Forbidden', 403, 'FORBIDDEN');
  if (listing.status === 'flagged') throw new AppError('Flagged listings cannot be removed — contact support', 403, 'LISTING_FLAGGED');

  const activeOrder = await prisma.order.findFirst({
    where: { listingId, fulfilmentStatus: { in: ['awaiting_dispatch', 'dispatched'] } },
    select: { id: true },
  });

  if (activeOrder) throw new AppError('Cannot remove a listing with an active order', 409, 'ACTIVE_ORDER_EXISTS');

  await prisma.listing.update({ where: { id: listingId }, data: { status: 'removed' } });

  return { success: true, message: 'Listing removed successfully.' };
}

// ─── 8. getMyListings ────────────────────────────────────────────────────────
async function getMyListings(sellerId, filters) {
  const { status, page, page_size } = filters;

  const where = { sellerId };
  if (status) where.status = status;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * page_size,
      take: page_size,
      select: {
        id: true,
        title: true,
        price: true,
        shippingFee: true,
        condition: true,
        status: true,
        photos: true,
        viewCount: true,
        wishlistCount: true,
        publishedAt: true,
        createdAt: true,
        updatedAt: true,
        brand: { select: { id: true, name: true, slug: true } },
        sport: { select: { id: true, name: true, slug: true } },
        subCategory: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings,
    pagination: {
      page,
      pageSize: page_size,
      totalResults: total,
      totalPages: Math.ceil(total / page_size),
    },
  };
}

// ─── 9. toggleFavourite ───────────────────────────────────────────────────────
async function toggleFavourite(userId, listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, sellerId: true, status: true, wishlistCount: true },
  });

  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');
  if (listing.sellerId === userId) throw new AppError('Cannot favourite your own listing', 400, 'OWN_LISTING');

  const existing = await prisma.favourite.findUnique({
    where: { userId_listingId: { userId, listingId } },
    select: { id: true },
  });

  if (existing) {
    await prisma.$transaction([
      prisma.favourite.delete({ where: { id: existing.id } }),
      prisma.listing.update({ where: { id: listingId }, data: { wishlistCount: { decrement: 1 } } }),
    ]);
    return { isFavourited: false, wishlistCount: Math.max(0, listing.wishlistCount - 1) };
  }

  await prisma.$transaction([
    prisma.favourite.create({ data: { userId, listingId } }),
    prisma.listing.update({ where: { id: listingId }, data: { wishlistCount: { increment: 1 } } }),
  ]);

  return { isFavourited: true, wishlistCount: listing.wishlistCount + 1 };
}

// ─── 10. getMyFavourites ──────────────────────────────────────────────────────
async function getMyFavourites(userId, filters) {
  const { page, page_size } = filters;

  const [favourites, total] = await Promise.all([
    prisma.favourite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * page_size,
      take: page_size,
      select: {
        id: true,
        createdAt: true,
        listing: {
          select: {
            id: true,
            title: true,
            price: true,
            shippingFee: true,
            condition: true,
            photos: true,
            status: true,
            colour: true,
            brand: { select: { id: true, name: true, slug: true } },
            sport: { select: { id: true, name: true, slug: true } },
            seller: { select: { id: true, username: true, verifiedSeller: true } },
          },
        },
      },
    }),
    prisma.favourite.count({ where: { userId } }),
  ]);

  return {
    favourites: favourites.map((f) => ({
      id: f.id,
      favouritedAt: f.createdAt,
      listing: { ...f.listing, isAvailable: f.listing.status === 'live' },
    })),
    pagination: {
      page,
      pageSize: page_size,
      totalResults: total,
      totalPages: Math.ceil(total / page_size),
    },
  };
}

// ─── 10b. getMyFavouriteIds ───────────────────────────────────────────────────
// Lets listing cards show the saved state without loading full favourite rows.
async function getMyFavouriteIds(userId) {
  const rows = await prisma.favourite.findMany({
    where: { userId },
    select: { listingId: true },
  });
  return { listingIds: rows.map((r) => r.listingId) };
}

// ─── 11. recordShare ─────────────────────────────────────────────────────────
async function recordShare(listingId, userId, destination, surface) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true },
  });
  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');

  await prisma.$transaction([
    prisma.share.create({ data: { listingId, userId: userId || null, destination, surface } }),
    prisma.listing.update({ where: { id: listingId }, data: { shareCount: { increment: 1 } } }),
  ]);

  return { success: true };
}

// ─── 12. getSharePreview ─────────────────────────────────────────────────────
async function getSharePreview(listingId) {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: { id: true, title: true, price: true, condition: true, photos: true, status: true },
  });
  if (!listing) throw new AppError('Listing not found', 404, 'LISTING_NOT_FOUND');

  return {
    title: listing.title,
    price: listing.price,
    condition: listing.condition,
    primaryPhoto: Array.isArray(listing.photos) ? listing.photos[0] ?? null : null,
    shareUrl: `${process.env.CLIENT_URL}/listings/${listing.id}`,
  };
}

module.exports = {
  createListing,
  publishListing,
  getListing,
  searchListings,
  getHomepageData,
  updateListing,
  deleteListing,
  getMyListings,
  toggleFavourite,
  getMyFavourites,
  getMyFavouriteIds,
  recordShare,
  getSharePreview,
};
