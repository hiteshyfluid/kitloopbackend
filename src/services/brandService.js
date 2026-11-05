const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');

function slugify(str) {
  return str.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Collapse whitespace and keep the seller's capitalisation ("gray  nicolls" → "gray nicolls")
function cleanName(name) {
  return name.trim().replace(/\s+/g, ' ');
}

const MAX_SELLER_BRANDS_PER_DAY = 10;

const PUBLIC_BRAND_SELECT = { id: true, name: true, slug: true, logoUrl: true };

// Brands for the sell form / filters. With a sport, only brands that make kit
// for it — mapped to the whole sport or to the chosen sub-category. Brands with
// no mapping at all are treated as general and shown everywhere.
async function listBrands({ search, sportId, subCategoryId } = {}) {
  const where = { status: 'active' };
  if (search) where.name = { contains: search, mode: 'insensitive' };

  if (subCategoryId && !sportId) {
    const sub = await prisma.subCategory.findUnique({ where: { id: subCategoryId }, select: { sportId: true } });
    sportId = sub?.sportId;
  }

  if (sportId) {
    const mapping = subCategoryId
      ? { sportId, OR: [{ subCategoryId: null }, { subCategoryId }] }
      : { sportId };
    where.OR = [{ categories: { some: mapping } }, { categories: { none: {} } }];
  }

  return prisma.brand.findMany({
    where,
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    select: PUBLIC_BRAND_SELECT,
  });
}

async function findBrandByName(name, tx = prisma) {
  return tx.brand.findFirst({
    where: { OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug: slugify(name) }] },
  });
}

// A seller types a brand that isn't in the list. Reuse an existing brand with
// the same name, otherwise create it — either way link it to this sport so it
// appears for the next seller of the same kind of kit.
async function createSellerBrand(userId, { name, sportId, subCategoryId }) {
  const brandName = cleanName(name);
  if (!slugify(brandName)) throw new AppError('Enter a valid brand name', 400, 'VALIDATION_ERROR');

  const sport = await prisma.sport.findFirst({ where: { id: sportId, status: 'active' }, select: { id: true } });
  if (!sport) throw new AppError('Sport not found', 404, 'SPORT_NOT_FOUND');
  if (subCategoryId) {
    const sub = await prisma.subCategory.findFirst({ where: { id: subCategoryId, sportId }, select: { id: true } });
    if (!sub) throw new AppError('That category does not belong to the selected sport', 400, 'INVALID_SUB_CATEGORY');
  }

  const existing = await findBrandByName(brandName);
  if (existing?.status === 'hidden') {
    throw new AppError('This brand can’t be used — please choose another', 400, 'BRAND_UNAVAILABLE');
  }

  if (!existing) {
    const recent = await prisma.brand.count({
      where: { createdById: userId, createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    if (recent >= MAX_SELLER_BRANDS_PER_DAY) {
      throw new AppError('You’ve added a lot of new brands today — please pick one from the list or try again tomorrow', 429, 'BRAND_LIMIT');
    }
  }

  const brand = existing ?? await prisma.brand.create({
    data: { name: brandName, slug: slugify(brandName), createdById: userId, displayOrder: 1000 },
  }).catch(async (err) => {
    // Two sellers adding the same brand at once
    if (err.code === 'P2002') return findBrandByName(brandName);
    throw err;
  });

  const alreadyMapped = await prisma.brandCategory.findFirst({
    where: { brandId: brand.id, sportId, OR: [{ subCategoryId: null }, { subCategoryId: subCategoryId ?? null }] },
    select: { id: true },
  });
  // Existing general brands (no mapping) stay general
  const isGeneral = existing && !(await prisma.brandCategory.count({ where: { brandId: brand.id } }));
  if (!alreadyMapped && !isGeneral) {
    await prisma.brandCategory.create({ data: { brandId: brand.id, sportId, subCategoryId: subCategoryId ?? null } });
  }

  return { brand: { id: brand.id, name: brand.name, slug: brand.slug, logoUrl: brand.logoUrl }, isNew: !existing };
}

// ─── Admin ────────────────────────────────────────────────────────────────────

const ADMIN_BRAND_SELECT = {
  id: true, name: true, slug: true, logoUrl: true, status: true, displayOrder: true, createdAt: true, updatedAt: true,
  createdBy: { select: { id: true, username: true } },
  categories: {
    select: {
      id: true,
      sport: { select: { id: true, name: true } },
      subCategory: { select: { id: true, name: true } },
    },
  },
  _count: { select: { listings: true } },
};

async function listAdminBrands({ search, sportId } = {}) {
  return prisma.brand.findMany({
    where: {
      ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
      ...(sportId ? { categories: { some: { sportId } } } : {}),
    },
    orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    select: ADMIN_BRAND_SELECT,
  });
}

async function validateCategories(categories) {
  const pairs = [];
  const seen = new Set();
  for (const c of categories) {
    const key = `${c.sportId}:${c.subCategoryId ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ sportId: c.sportId, subCategoryId: c.subCategoryId ?? null });
  }

  const sportIds = [...new Set(pairs.map((p) => p.sportId))];
  const subIds = pairs.map((p) => p.subCategoryId).filter(Boolean);
  const [sportCount, subs] = await Promise.all([
    prisma.sport.count({ where: { id: { in: sportIds } } }),
    subIds.length ? prisma.subCategory.findMany({ where: { id: { in: subIds } }, select: { id: true, sportId: true } }) : [],
  ]);
  if (sportCount !== sportIds.length) throw new AppError('One or more sports do not exist', 400, 'INVALID_SPORT');
  const subSport = new Map(subs.map((s) => [s.id, s.sportId]));
  for (const p of pairs) {
    if (p.subCategoryId && subSport.get(p.subCategoryId) !== p.sportId) {
      throw new AppError('A category does not belong to its sport', 400, 'INVALID_SUB_CATEGORY');
    }
  }
  return pairs;
}

async function createBrand(adminId, { name, logoUrl, status = 'active', displayOrder = 0, categories = [] }) {
  const brandName = cleanName(name);
  if (await findBrandByName(brandName)) throw new AppError('A brand with this name already exists', 409, 'BRAND_EXISTS');
  const pairs = await validateCategories(categories);

  const brand = await prisma.$transaction(async (tx) => {
    const created = await tx.brand.create({
      data: {
        name: brandName, slug: slugify(brandName), logoUrl: logoUrl || null, status, displayOrder,
        categories: { create: pairs },
      },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'brand_added', targetType: 'brand', targetId: created.id,
        newValue: { name: brandName, categories: pairs },
      },
    });
    return created;
  });

  return prisma.brand.findUnique({ where: { id: brand.id }, select: ADMIN_BRAND_SELECT });
}

async function updateBrand(brandId, adminId, { name, logoUrl, status, displayOrder, categories }) {
  const existing = await prisma.brand.findUnique({ where: { id: brandId }, select: ADMIN_BRAND_SELECT });
  if (!existing) throw new AppError('Brand not found', 404, 'NOT_FOUND');

  const data = {};
  if (name !== undefined) {
    const brandName = cleanName(name);
    const clash = await findBrandByName(brandName);
    if (clash && clash.id !== brandId) throw new AppError('A brand with this name already exists', 409, 'BRAND_EXISTS');
    data.name = brandName;
    data.slug = slugify(brandName);
  }
  if (logoUrl !== undefined) data.logoUrl = logoUrl || null;
  if (status !== undefined) data.status = status;
  if (displayOrder !== undefined) data.displayOrder = displayOrder;
  const pairs = categories !== undefined ? await validateCategories(categories) : undefined;

  await prisma.$transaction(async (tx) => {
    await tx.brand.update({
      where: { id: brandId },
      data: { ...data, ...(pairs ? { categories: { deleteMany: {}, create: pairs } } : {}) },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'brand_edited', targetType: 'brand', targetId: brandId,
        previousValue: { name: existing.name, status: existing.status },
        newValue: { ...data, ...(pairs ? { categories: pairs } : {}) },
      },
    });
  });

  return prisma.brand.findUnique({ where: { id: brandId }, select: ADMIN_BRAND_SELECT });
}

// Brands with listings can only be hidden, never deleted
async function deleteBrand(brandId, adminId) {
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true, name: true, _count: { select: { listings: true } } } });
  if (!brand) throw new AppError('Brand not found', 404, 'NOT_FOUND');
  if (brand._count.listings > 0) {
    throw new AppError('This brand is used by listings — hide it instead', 409, 'BRAND_IN_USE');
  }
  await prisma.$transaction(async (tx) => {
    await tx.brand.delete({ where: { id: brandId } });
    await tx.auditLog.create({
      data: { adminId, actionType: 'brand_edited', targetType: 'brand', targetId: brandId, previousValue: { name: brand.name }, newValue: { deleted: true } },
    });
  });
}

module.exports = { listBrands, createSellerBrand, listAdminBrands, createBrand, updateBrand, deleteBrand, slugify };
