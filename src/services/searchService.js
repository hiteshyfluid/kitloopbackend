const prisma = require('../lib/prisma');

// ─── Search-as-you-type suggestions ───────────────────────────────────────────
// Powers the header search dropdown: matching sports / sub-categories, a few
// matching live listings, and a "did you mean" correction when nothing matches.

const CATALOG_TTL_MS = 5 * 60 * 1000;
const MAX_CATEGORIES = 6;
const MAX_LISTINGS = 4;

const SUGGEST_LISTING_SELECT = {
  id: true,
  title: true,
  price: true,
  condition: true,
  colour: true,
  photos: true,
  sport: { select: { id: true, name: true, slug: true } },
  subCategory: { select: { id: true, name: true, slug: true } },
  brand: { select: { id: true, name: true, slug: true } },
};

// Sports, sub-categories and brands change rarely — keep a small in-memory copy.
let catalogCache = null;
let catalogLoadedAt = 0;

async function loadCatalog() {
  if (catalogCache && Date.now() - catalogLoadedAt < CATALOG_TTL_MS) return catalogCache;

  const [sports, subCategories, brands] = await Promise.all([
    prisma.sport.findMany({
      where: { status: 'active' },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true, listingCount: true },
    }),
    prisma.subCategory.findMany({
      where: { status: 'active', sport: { status: 'active' } },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, name: true, slug: true, listingCount: true, sport: { select: { name: true, slug: true } } },
    }),
    prisma.brand.findMany({ where: { status: 'active' }, select: { name: true } }),
  ]);

  const categories = [
    ...sports.map((s) => ({
      type: 'sport',
      label: s.name,
      sportName: s.name,
      sportSlug: s.slug,
      subCategorySlug: null,
      listingCount: s.listingCount,
    })),
    ...subCategories.map((sc) => ({
      type: 'sub_category',
      label: sc.name,
      sportName: sc.sport.name,
      sportSlug: sc.sport.slug,
      subCategorySlug: sc.slug,
      listingCount: sc.listingCount,
    })),
  ];

  catalogCache = { categories, vocabulary: buildVocabulary([...categories.map((c) => c.label), ...brands.map((b) => b.name)]) };
  catalogLoadedAt = Date.now();
  return catalogCache;
}

// Vocabulary for spelling correction: single words plus adjacent word pairs
// joined without a space, so "shinpad" can still resolve to "shin pads".
function buildVocabulary(phrases) {
  const vocab = new Map(); // key (no spaces) -> display form
  for (const phrase of phrases) {
    const words = phrase.toLowerCase().replace(/[^a-z0-9&\s-]/g, ' ').split(/\s+/).filter((w) => w.length >= 2 && w !== '&');
    words.forEach((w, i) => {
      if (!vocab.has(w)) vocab.set(w, w);
      if (words[i + 1]) {
        const pair = `${w}${words[i + 1]}`;
        if (!vocab.has(pair)) vocab.set(pair, `${w} ${words[i + 1]}`);
      }
    });
  }
  return vocab;
}

function levenshtein(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const curr = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, curr[j]);
    }
    if (rowMin > max) return max + 1;
    prev = curr;
  }
  return prev[b.length];
}

function correctPhrase(q, vocab) {
  let changed = false;
  const corrected = q.toLowerCase().split(/\s+/).filter(Boolean).map((token) => {
    if (token.length < 3 || vocab.has(token)) return token;
    const max = token.length <= 4 ? 1 : token.length <= 8 ? 2 : 3;
    let best = null;
    let bestDist = max + 1;
    for (const [key, display] of vocab) {
      const d = levenshtein(token, key, max);
      if (d < bestDist || (d === bestDist && best && display.length < best.length)) {
        best = display;
        bestDist = d;
      }
    }
    if (best && best !== token) changed = true;
    return best ?? token;
  });
  return changed ? corrected.join(' ') : null;
}

function matchCategories(categories, q) {
  const needle = q.toLowerCase();
  return categories
    .map((c) => {
      const label = c.label.toLowerCase();
      const idx = label.indexOf(needle);
      if (idx < 0) return null;
      // Rank: starts-with first, sports before sub-categories, then popularity
      const rank = (idx === 0 ? 0 : 2) + (c.type === 'sport' ? 0 : 1);
      return { ...c, rank };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || b.listingCount - a.listingCount || a.label.localeCompare(b.label))
    // A sub-category named exactly like a sport (e.g. "Football" balls) would read as a duplicate
    .filter((c, i, all) => all.findIndex((o) => o.label.toLowerCase() === c.label.toLowerCase()) === i)
    .slice(0, MAX_CATEGORIES)
    .map(({ rank, ...c }) => c);
}

// Every word must appear somewhere (title, description, brand, sub-category or
// sport), so "football shin pads" finds a "Shin pads" listing under Football.
function textSearchWhere(q, { includeDescription = true } = {}) {
  const tokens = q.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
  return {
    AND: tokens.map((t) => ({
      OR: [
        { title: { contains: t, mode: 'insensitive' } },
        ...(includeDescription ? [{ description: { contains: t, mode: 'insensitive' } }] : []),
        { brand: { name: { contains: t, mode: 'insensitive' } } },
        { subCategory: { name: { contains: t, mode: 'insensitive' } } },
        { sport: { name: { contains: t, mode: 'insensitive' } } },
      ],
    })),
  };
}

function listingWhere(q) {
  return {
    status: 'live',
    seller: { accountStatus: 'active' },
    ...textSearchWhere(q, { includeDescription: false }),
  };
}

async function suggest(q) {
  const query = q.trim().slice(0, 80);
  if (!query) return { query, categories: [], listings: [], didYouMean: null };

  const [{ categories: catalog, vocabulary }, listings] = await Promise.all([
    loadCatalog(),
    prisma.listing.findMany({
      where: listingWhere(query),
      orderBy: { publishedAt: 'desc' },
      take: MAX_LISTINGS,
      select: SUGGEST_LISTING_SELECT,
    }),
  ]);

  const categories = matchCategories(catalog, query);

  // Corrections are built only from real catalogue words (sports, sub-categories, brands)
  const didYouMean = !categories.length && !listings.length ? correctPhrase(query, vocabulary) : null;

  return { query, categories, listings, didYouMean };
}

module.exports = { suggest, textSearchWhere };
