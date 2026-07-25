const { z } = require('zod');

const sportIdParamSchema = z.object({
  sport_id: z.string().uuid('Invalid sport_id'),
});

const brandsQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
});

module.exports = { sportIdParamSchema, brandsQuerySchema };
