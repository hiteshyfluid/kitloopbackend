const fs = require('fs');
const path = require('path');

require('dotenv').config();
const prisma = require('../lib/prisma');

const CSV_PATH = path.join(__dirname, '../../prisma/seed-data/sport-master.csv');
const VARIANTS_CSV_PATH = path.join(__dirname, '../../prisma/seed-data/product-variants.csv');

// The product-variants sheet names some products differently from the
// sub-category list — "Sport|Product Category" → sub-category name.
const VARIANT_SUBCATEGORY_ALIASES = {
  'Cricket|Batting gloves': 'Cricket gloves',
  'Football|Football (ball)': 'Football',
  'Golf|Golf irons (set)': 'Golf irons set',
  'Golf|Golf ball': 'Golf balls',
  'Tennis|Tennis ball': 'Tennis balls',
  'Squash|Squash ball': 'Squash balls',
  'Running|GPS running watch': 'Running watch',
  'Skiing|Ski (pair)': 'Ski pair',
  'Skiing|Ski boots (pair)': 'Ski boots',
  'Ice Hockey|Hockey stick': 'Ice hockey stick',
  'Ice Hockey|Ice skates (pair)': 'Ice hockey skates',
  'Badminton|Shuttlecock': 'Badminton shuttlecocks',
  'Boxing & MMA|Boxing gloves (pair)': 'Boxing gloves',
  'Cycling|Cycling shoes (pair)': 'Cycling shoes',
  'Netball|Knee pads (pair)': 'Netball knee pads',
  'Swimming|Racing suit / wetsuit': 'Swimming costume',
  'American Football|Football (ball)': 'Am. Football',
  'American Football|Football helmet': 'Am. Football helmet',
  'American Football|Shoulder pads': 'Am. Football shoulder pads',
};

// The order the SRS/task lists sports in — used as the canonical
// "Browse by Sport" display order.
const SPORT_ORDER = [
  'Cricket',
  'Football',
  'Golf',
  'Tennis',
  'Padel',
  'Squash',
  'Running',
  'Skiing',
  'American Football',
  'Basketball',
  'Ice Hockey',
  'Netball',
  'Cycling',
  'Swimming',
  'Rugby',
  'Badminton',
  'Boxing & MMA',
];

const SPORT_TAGS = {
  Cricket: 'bat_ball',
  Football: 'team',
  Golf: 'precision',
  Tennis: 'racket',
  Padel: 'racket',
  Squash: 'racket',
  Running: 'endurance',
  Skiing: 'snow',
  'American Football': 'team',
  Basketball: 'team',
  'Ice Hockey': 'team',
  Netball: 'team',
  Cycling: 'endurance',
  Swimming: 'water',
  Rugby: 'team',
  Badminton: 'racket',
  'Boxing & MMA': 'combat',
};

// Starter catalog — no brand list exists in the source docs, so this is a
// reasonable real-world set covering the 17 seeded sports. Easy to extend
// later via the admin category management panel.
const BRANDS = [
  'Nike',
  'Adidas',
  'Puma',
  'Under Armour',
  'New Balance',
  'Asics',
  'Gray-Nicolls',
  'Gunn & Moore',
  'Kookaburra',
  'Callaway',
  'TaylorMade',
  'Titleist',
  'Ping',
  'Wilson',
  'Babolat',
  'Head',
  'Yonex',
  'Salomon',
  'Atomic',
  'Rossignol',
  'Trek',
  'Specialized',
  'Giant',
  'Speedo',
  'Arena',
  'Everlast',
  'Venum',
  'Bauer',
  'CCM',
  'Canterbury',
  'Gilbert',
];

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);

  const [header, ...rows] = lines;
  const columns = header.split(',').map((c) => c.trim());

  return rows.map((line) => {
    const values = line.split(',').map((v) => v.trim());
    const row = {};
    columns.forEach((col, i) => {
      row[col] = values[i];
    });
    return row;
  });
}

// Quote-aware variant of parseCsv — the variants sheet has commas inside quoted notes.
function parseQuotedCsv(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const records = [];
  let record = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < raw.length; i += 1) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"' && raw[i + 1] === '"') { field += '"'; i += 1; }
      else if (ch === '"') inQuotes = false;
      else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ',') { record.push(field.trim()); field = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && raw[i + 1] === '\n') i += 1;
      record.push(field.trim());
      if (record.some(Boolean)) records.push(record);
      record = [];
      field = '';
    } else field += ch;
  }
  record.push(field.trim());
  if (record.some(Boolean)) records.push(record);

  const [header, ...rows] = records;
  return rows.map((values) => Object.fromEntries(header.map((col, i) => [col, values[i] ?? ''])));
}

function blankToNull(value) {
  return value && value !== 'N/A' && value !== '—' ? value : null;
}

function toHandedness(value) {
  if (/^left/i.test(value)) return 'left';
  if (/^right/i.test(value)) return 'right';
  return null;
}

async function seedVariantOptions(sportIds) {
  const rows = parseQuotedCsv(VARIANTS_CSV_PATH);
  const subCategoryCache = new Map();
  const orderBySubCategory = new Map();
  const unmatched = new Set();
  let count = 0;

  for (const row of rows) {
    const sportName = row.Sport;
    const product = row['Product Category'];
    const key = `${sportName}|${product}`;
    const sportId = sportIds[sportName];

    if (!subCategoryCache.has(key)) {
      const name = VARIANT_SUBCATEGORY_ALIASES[key] ?? product;
      const subCategory = sportId
        ? await prisma.subCategory.findUnique({ where: { sportId_slug: { sportId, slug: slugify(name) } }, select: { id: true } })
        : null;
      subCategoryCache.set(key, subCategory?.id ?? null);
    }

    const subCategoryId = subCategoryCache.get(key);
    if (!subCategoryId) {
      unmatched.add(key);
      continue;
    }

    const displayOrder = (orderBySubCategory.get(subCategoryId) ?? 0) + 1;
    orderBySubCategory.set(subCategoryId, displayOrder);

    const dimension = row['Variant Dimension'];
    const value = row['Variant Value'];
    const data = {
      notes: blankToNull(row['Variant Notes']),
      handedness: toHandedness(row.Handedness),
      gender: blankToNull(row.Gender),
      ageGroup: blankToNull(row['Age Group']),
      surface: blankToNull(row['Surface / Terrain']),
      shippingBoxCm: blankToNull(row['Shipping Box (L x W x H cm)']),
      estWeight: blankToNull(row['Est. Weight']),
      displayOrder,
    };

    await prisma.variantOption.upsert({
      where: { subCategoryId_dimension_value: { subCategoryId, dimension, value } },
      update: data,
      create: { subCategoryId, dimension, value, ...data, status: 'active' },
    });
    count += 1;
  }

  for (const key of unmatched) {
    console.warn(`  ! No sub-category for variant product "${key.replace('|', ' → ')}" — skipped`);
  }

  return count;
}

async function seedSports(rowsBySport) {
  const sportIds = {};

  for (const sportName of SPORT_ORDER) {
    const displayOrder = SPORT_ORDER.indexOf(sportName) + 1;
    const slug = slugify(sportName);

    const sport = await prisma.sport.upsert({
      where: { slug },
      update: { name: sportName, displayOrder, sportTag: SPORT_TAGS[sportName] },
      create: {
        name: sportName,
        slug,
        iconUrl: `https://assets.kitloop.com/sports/${slug}.svg`,
        sportTag: SPORT_TAGS[sportName],
        displayOrder,
        status: 'active',
      },
    });

    sportIds[sportName] = sport.id;
    console.log(`  ✓ Sport: ${sportName} (${rowsBySport[sportName]?.length || 0} sub-categories)`);
  }

  return sportIds;
}

async function seedSubCategories(rowsBySport, sportIds) {
  let count = 0;

  for (const [sportName, rows] of Object.entries(rowsBySport)) {
    const sportId = sportIds[sportName];
    if (!sportId) {
      console.warn(`  ! Skipping sub-categories for unknown sport "${sportName}" — not in SPORT_ORDER`);
      continue;
    }

    for (let i = 0; i < rows.length; i += 1) {
      const { sub_category: name, parcel_size: parcelSize } = rows[i];
      const slug = slugify(name);

      await prisma.subCategory.upsert({
        where: { sportId_slug: { sportId, slug } },
        update: {
          name,
          recommendedParcelSize: parcelSize,
          isOversized: parcelSize === 'oversized',
          displayOrder: i + 1,
        },
        create: {
          sportId,
          name,
          slug,
          recommendedParcelSize: parcelSize,
          isOversized: parcelSize === 'oversized',
          displayOrder: i + 1,
          status: 'active',
        },
      });
      count += 1;
    }
  }

  return count;
}

async function seedBrands() {
  let count = 0;

  for (let i = 0; i < BRANDS.length; i += 1) {
    const name = BRANDS[i];
    const slug = slugify(name);

    await prisma.brand.upsert({
      where: { slug },
      update: { name, displayOrder: i + 1 },
      create: {
        name,
        slug,
        logoUrl: `https://assets.kitloop.com/brands/${slug}.svg`,
        status: 'active',
        displayOrder: i + 1,
      },
    });
    count += 1;
  }

  return count;
}

async function main() {
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`Sport master CSV not found at ${CSV_PATH}`);
  }

  const rows = parseCsv(CSV_PATH);
  const csvSports = [...new Set(rows.map((r) => r.sport))];
  const unknownSports = csvSports.filter((s) => !SPORT_ORDER.includes(s));
  if (unknownSports.length > 0) {
    throw new Error(
      `CSV contains sport(s) not in SPORT_ORDER: ${unknownSports.join(', ')}. Add them to SPORT_ORDER/SPORT_TAGS in seedData.js first.`
    );
  }

  const rowsBySport = rows.reduce((acc, row) => {
    acc[row.sport] = acc[row.sport] || [];
    acc[row.sport].push(row);
    return acc;
  }, {});

  console.log(`Seeding ${SPORT_ORDER.length} sports from ${CSV_PATH} (${rows.length} sub-category rows)...`);
  const sportIds = await seedSports(rowsBySport);

  console.log('Seeding sub-categories...');
  const subCategoryCount = await seedSubCategories(rowsBySport, sportIds);
  console.log(`  ✓ ${subCategoryCount} sub-categories seeded`);

  console.log('Seeding variant options...');
  const variantCount = await seedVariantOptions(sportIds);
  console.log(`  ✓ ${variantCount} variant options seeded`);

  console.log(`Seeding ${BRANDS.length} brands...`);
  const brandCount = await seedBrands();
  console.log(`  ✓ ${brandCount} brands seeded`);

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
