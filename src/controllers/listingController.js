const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const cloudinaryService = require('../services/cloudinaryService');
const listingService = require('../services/listingService');
const searchService = require('../services/searchService');
const {
  createListingSchema,
  updateListingSchema,
  searchSchema,
  shareSchema,
  myListingsSchema,
  paginationSchema,
} = require('../validators/listingValidators');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

// ─── POST /api/listings ───────────────────────────────────────────────────────
const createListing = catchAsync(async (req, res) => {
  const photoFiles = req.files?.photos || [];
  const videoFile = req.files?.video?.[0];

  // Accept pre-uploaded URLs from client-side immediate upload flow
  const preUploadedPhotos = (() => {
    const raw = req.body.photo_urls;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter((u) => typeof u === 'string' && u.startsWith('http'));
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter((u) => typeof u === 'string') : [];
    } catch { return []; }
  })();

  if (!preUploadedPhotos.length && !photoFiles.length) {
    throw new AppError('At least one photo is required', 400, 'NO_PHOTOS');
  }

  const body = validate(createListingSchema, req.body);

  const [photoUrls, videoUrl] = await Promise.all([
    preUploadedPhotos.length
      ? Promise.resolve(preUploadedPhotos)
      : Promise.all(photoFiles.map((f) => cloudinaryService.uploadPhoto(f))),
    videoFile
      ? cloudinaryService.uploadVideo(videoFile)
      : Promise.resolve(req.body.video_url || null),
  ]);

  const listing = await listingService.createListing(req.user.id, {
    title: body.title,
    description: body.description,
    sportId: body.sport_id,
    subCategoryId: body.sub_category_id,
    brandId: body.brand_id,
    condition: body.condition,
    colour: body.colour,
    price: body.price,
    parcelSize: body.parcel_size,
    photos: photoUrls,
    videoUrl,
  });

  sendSuccess(res, 201, { listing });
});

// ─── POST /api/listings/:id/publish ──────────────────────────────────────────
const publishListing = catchAsync(async (req, res) => {
  const listing = await listingService.publishListing(req.params.id, req.user.id);
  sendSuccess(res, 200, { listing });
});

// ─── GET /api/listings/:id ────────────────────────────────────────────────────
const getListing = catchAsync(async (req, res) => {
  const { statusCode, listing } = await listingService.getListing(
    req.params.id,
    req.user?.id ?? null,
    req.ip,
  );
  sendSuccess(res, statusCode, { listing });
});

// ─── PUT /api/listings/:id ────────────────────────────────────────────────────
const updateListing = catchAsync(async (req, res) => {
  const body = validate(updateListingSchema, req.body);
  const photoFiles = req.files?.photos;
  const videoFile = req.files?.video?.[0];

  let photos;
  if (photoFiles?.length) {
    photos = await Promise.all(photoFiles.map((f) => cloudinaryService.uploadPhoto(f)));
  } else if (body.photo_urls !== undefined) {
    photos = body.photo_urls;
  }

  let videoUrl;
  if (videoFile) {
    videoUrl = await cloudinaryService.uploadVideo(videoFile);
  } else if (body.video_url !== undefined) {
    videoUrl = body.video_url ?? null;
  }

  const updateData = { ...body };
  if (photos !== undefined) updateData.photos = photos;
  if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
  if (body.parcel_size !== undefined) updateData.parcelSize = body.parcel_size;
  if (body.sport_id !== undefined) updateData.sportId = body.sport_id;
  if (body.sub_category_id !== undefined) updateData.subCategoryId = body.sub_category_id;
  if (body.brand_id !== undefined) updateData.brandId = body.brand_id;
  delete updateData.parcel_size;
  delete updateData.video_url;
  delete updateData.photo_urls;
  delete updateData.sport_id;
  delete updateData.sub_category_id;
  delete updateData.brand_id;

  const listing = await listingService.updateListing(req.params.id, req.user.id, updateData);
  sendSuccess(res, 200, { listing });
});

// ─── DELETE /api/listings/:id ─────────────────────────────────────────────────
const deleteListing = catchAsync(async (req, res) => {
  const result = await listingService.deleteListing(req.params.id, req.user.id);
  sendSuccess(res, 200, result);
});

// ─── GET /api/listings/mine ───────────────────────────────────────────────────
const getMyListings = catchAsync(async (req, res) => {
  const filters = validate(myListingsSchema, req.query);
  const result = await listingService.getMyListings(req.user.id, filters);
  sendSuccess(res, 200, result);
});

// ─── GET /api/listings ────────────────────────────────────────────────────────
const searchListings = catchAsync(async (req, res) => {
  const filters = validate(searchSchema, req.query);
  const result = await listingService.searchListings(filters);
  sendSuccess(res, 200, result);
});

// ─── GET /api/search/suggest ──────────────────────────────────────────────────
const searchSuggest = catchAsync(async (req, res) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';
  const result = await searchService.suggest(q);
  sendSuccess(res, 200, result);
});

// ─── GET /api/home ────────────────────────────────────────────────────────────
const getHomepageData = catchAsync(async (req, res) => {
  const result = await listingService.getHomepageData(req.user?.id ?? null);
  sendSuccess(res, 200, result);
});

// ─── POST /api/listings/:id/share ─────────────────────────────────────────────
const recordShare = catchAsync(async (req, res) => {
  const { destination, surface } = validate(shareSchema, req.body);
  const result = await listingService.recordShare(req.params.id, req.user?.id ?? null, destination, surface);
  sendSuccess(res, 200, result);
});

// ─── GET /api/listings/:id/share-preview ──────────────────────────────────────
const getSharePreview = catchAsync(async (req, res) => {
  const result = await listingService.getSharePreview(req.params.id);
  sendSuccess(res, 200, result);
});

// ─── POST /api/listings/:id/favourite ────────────────────────────────────────
const toggleFavourite = catchAsync(async (req, res) => {
  const result = await listingService.toggleFavourite(req.user.id, req.params.id);
  sendSuccess(res, 200, result);
});

// ─── GET /api/favourites ─────────────────────────────────────────────────────
const getMyFavourites = catchAsync(async (req, res) => {
  const filters = validate(paginationSchema, req.query);
  const result = await listingService.getMyFavourites(req.user.id, filters);
  sendSuccess(res, 200, result);
});

// ─── GET /api/favourites/ids ─────────────────────────────────────────────────
const getMyFavouriteIds = catchAsync(async (req, res) => {
  const result = await listingService.getMyFavouriteIds(req.user.id);
  res.set('Cache-Control', 'no-store');
  sendSuccess(res, 200, result);
});

module.exports = {
  createListing,
  publishListing,
  getListing,
  updateListing,
  deleteListing,
  getMyListings,
  searchListings,
  searchSuggest,
  getHomepageData,
  recordShare,
  getSharePreview,
  toggleFavourite,
  getMyFavourites,
  getMyFavouriteIds,
};
