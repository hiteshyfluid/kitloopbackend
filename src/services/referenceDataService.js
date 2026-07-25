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
  });

  return subCategories.map((subCategory) => ({
    id: subCategory.id,
    name: subCategory.name,
    slug: subCategory.slug,
    recommendedParcelSize: subCategory.recommendedParcelSize,
    isOversized: subCategory.isOversized,
  }));
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

module.exports = { listSports, listSubCategoriesForSport, listBrands };
