const referenceDataService = require('../services/referenceDataService');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { sportIdParamSchema } = require('../validators/referenceDataValidators');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

// GET /sports
const getSports = catchAsync(async (req, res) => {
  const sports = await referenceDataService.listSports();
  sendSuccess(res, 200, { sports });
});

// GET /sports/:sport_id/sub-categories
const getSubCategories = catchAsync(async (req, res) => {
  const { sport_id: sportId } = validate(sportIdParamSchema, req.params);
  const subCategories = await referenceDataService.listSubCategoriesForSport(sportId);
  sendSuccess(res, 200, { subCategories });
});

module.exports = { getSports, getSubCategories };
