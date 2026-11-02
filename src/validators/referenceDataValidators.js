const { z } = require('zod');

const sportIdParamSchema = z.object({
  sport_id: z.string().uuid('Invalid sport_id'),
});

const subCategoryParamSchema = z.object({
  sport_id: z.string().uuid('Invalid sport_id'),
  sub_category_id: z.string().uuid('Invalid sub_category_id'),
});

const brandsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
});

module.exports = { sportIdParamSchema, subCategoryParamSchema, brandsQuerySchema };
