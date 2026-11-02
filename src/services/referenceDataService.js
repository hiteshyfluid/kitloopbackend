const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

async function listSports() {
  const sports = await prisma.sport.findMany({
    where: { status: 'active' },
    orderBy: { displayOrder: 'asc' },
  });

  return sports.map((sport) => ({
    id: sport.id,
    name: sport.name,
    slug: sport.slug,
    iconUrl: sport.iconUrl,
    displayOrder: sport.displayOrder,
  }));
}

async function listSubCategoriesForSport(sportId) {
  const sport = await prisma.sport.findUnique({ where: { id: sportId } });
  if (!sport || sport.status !== 'active') {
    throw new AppError('Sport not found', 404, 'SPORT_NOT_FOUND');
  }

  const subCategories = await prisma.subCategory.findMany({
    where: { sportId, status: 'active' },
    orderBy: { displayOrder: 'asc' },
    include: { _count: { select: { variantOptions: { where: { status: 'active' } } } } },
  });

  return subCategories.map((subCategory) => ({
    id: subCategory.id,
    name: subCategory.name,
    slug: subCategory.slug,
    recommendedParcelSize: subCategory.recommendedParcelSize,
    isOversized: subCategory.isOversized,
    hasVariantOptions: subCategory._count.variantOptions > 0,
  }));
}

// Variant options grouped by dimension, e.g. Cricket bat →
// [{ name: 'Size', options: [...] }, { name: 'Willow Grade', options: [...] }].
// An empty list means the sub-category has no options to pick.
async function listVariantOptionsForSubCategory(sportId, subCategoryId) {
  const subCategory = await prisma.subCategory.findFirst({
    where: { id: subCategoryId, sportId, status: 'active' },
    select: { id: true },
  });
  if (!subCategory) {
    throw new AppError('Sub-category not found', 404, 'SUB_CATEGORY_NOT_FOUND');
  }

  const options = await prisma.variantOption.findMany({
    where: { subCategoryId, status: 'active' },
    orderBy: { displayOrder: 'asc' },
    select: {
      id: true,
      dimension: true,
      value: true,
      notes: true,
      handedness: true,
      gender: true,
      ageGroup: true,
    },
  });

  const dimensions = new Map();
  for (const { dimension, ...option } of options) {
    if (!dimensions.has(dimension)) dimensions.set(dimension, []);
    dimensions.get(dimension).push(option);
  }

  return [...dimensions].map(([name, opts]) => ({ name, options: opts }));
}

async function listBrands(search) {
  const brands = await prisma.brand.findMany({
    where: {
      status: 'active',
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
    },
    orderBy: { displayOrder: 'asc' },
  });

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
  }));
}

module.exports = { listSports, listSubCategoriesForSport, listVariantOptionsForSubCategory, listBrands };
