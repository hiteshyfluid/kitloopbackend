const referenceDataService = require('../services/referenceDataService');
const brandService = require('../services/brandService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { brandsQuerySchema, createSellerBrandSchema, adminBrandSchema } = require('../validators/referenceDataValidators');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const toCategories = (categories) => categories?.map((c) => ({ sportId: c.sport_id, subCategoryId: c.sub_category_id ?? null }));

// GET /brands?search=gray&sport_id=…&sub_category_id=…
const getBrands = catchAsync(async (req, res) => {
  const { search, sport_id, sub_category_id } = validate(brandsQuerySchema, req.query);
  const brands = sport_id || sub_category_id
    ? await brandService.listBrands({ search, sportId: sport_id, subCategoryId: sub_category_id })
    : await referenceDataService.listBrands(search);
  sendSuccess(res, 200, { brands });
});

// POST /brands — a seller enters a brand by hand on the sell form
const createSellerBrand = catchAsync(async (req, res) => {
  const { name, sport_id, sub_category_id } = validate(createSellerBrandSchema, req.body);
  const { brand, isNew } = await brandService.createSellerBrand(req.user.id, {
    name, sportId: sport_id, subCategoryId: sub_category_id ?? null,
  });
  sendSuccess(res, isNew ? 201 : 200, { brand, isNew });
});

// ─── Admin ────────────────────────────────────────────────────────────────────

// GET /admin/brands
const adminListBrands = catchAsync(async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : undefined;
  const sportId = typeof req.query.sport_id === 'string' && /^[0-9a-f-]{36}$/i.test(req.query.sport_id) ? req.query.sport_id : undefined;
  const brands = await brandService.listAdminBrands({ search: search || undefined, sportId });
  sendSuccess(res, 200, { brands });
});

// POST /admin/brands
const adminCreateBrand = catchAsync(async (req, res) => {
  const body = validate(adminBrandSchema, req.body);
  const brand = await brandService.createBrand(req.user.id, {
    name: body.name, logoUrl: body.logo_url, status: body.status, displayOrder: body.display_order,
    categories: toCategories(body.categories) ?? [],
  });
  sendSuccess(res, 201, { brand });
});

// PATCH /admin/brands/:id
const adminUpdateBrand = catchAsync(async (req, res) => {
  const body = validate(adminBrandSchema.partial(), req.body);
  const brand = await brandService.updateBrand(req.params.id, req.user.id, {
    name: body.name, logoUrl: body.logo_url, status: body.status, displayOrder: body.display_order,
    categories: toCategories(body.categories),
  });
  sendSuccess(res, 200, { brand });
});

// DELETE /admin/brands/:id
const adminDeleteBrand = catchAsync(async (req, res) => {
  await brandService.deleteBrand(req.params.id, req.user.id);
  sendSuccess(res, 200, { message: 'Brand deleted' });
});

module.exports = { getBrands, createSellerBrand, adminListBrands, adminCreateBrand, adminUpdateBrand, adminDeleteBrand };
