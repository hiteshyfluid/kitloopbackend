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
  sport_id: z.string().uuid('Invalid sport_id').optional(),
  sub_category_id: z.string().uuid('Invalid sub_category_id').optional(),
});

const brandName = z.string().trim()
  .min(2, 'Brand name must be at least 2 characters')
  .max(60, 'Brand name must be under 60 characters')
  .regex(/^[\p{L}\p{N}][\p{L}\p{N} &'.+\-/]*$/u, "Brand name can only contain letters, numbers, spaces and & ' . + - /");

const createSellerBrandSchema = z.object({
  name: brandName,
  sport_id: z.string().uuid('Choose a sport first'),
  sub_category_id: z.string().uuid().optional().nullable(),
});

const brandCategoriesSchema = z.array(z.object({
  sport_id: z.string().uuid('Invalid sport_id'),
  sub_category_id: z.string().uuid().nullable().optional(),
})).max(100);

const adminBrandSchema = z.object({
  name: brandName,
  logo_url: z.string().trim().url().max(2000).nullable().optional(),
  status: z.enum(['active', 'hidden']).optional(),
  display_order: z.coerce.number().int().min(0).max(100000).optional(),
  categories: brandCategoriesSchema.optional(),
});

module.exports = {
  sportIdParamSchema, subCategoryParamSchema, brandsQuerySchema,
  createSellerBrandSchema, adminBrandSchema,
};
