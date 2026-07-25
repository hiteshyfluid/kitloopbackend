const referenceDataService = require('../services/referenceDataService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { brandsQuerySchema } = require('../validators/referenceDataValidators');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

// GET /brands?search=gray
const getBrands = catchAsync(async (req, res) => {
  const { search } = validate(brandsQuerySchema, req.query);
  const brands = await referenceDataService.listBrands(search);
  sendSuccess(res, 200, { brands });
});

module.exports = { getBrands };
