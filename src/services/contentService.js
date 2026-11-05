const prisma = require('../lib/prisma');
const AppError = require('../utils/AppError');
const { SITE_CONTENT_SECTIONS, SITE_CONTENT_FIELDS, SITE_CONTENT_DEFAULTS } = require('../config/siteContent');

const SITE_CONTENT_KEY = 'site_content';

function slugify(str) {
  return String(str).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 180);
}

// ─── SITE CONTENT ─────────────────────────────────────────────────────────────

async function readSavedContent() {
  const row = await prisma.siteSetting.findUnique({ where: { settingKey: SITE_CONTENT_KEY } });
  if (!row?.settingValue) return {};
  try {
    const parsed = JSON.parse(row.settingValue);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

// Saved values over defaults; unknown keys from older versions are dropped
async function getSiteContent() {
  const saved = await readSavedContent();
  const content = {};
  for (const { key } of SITE_CONTENT_FIELDS) {
    content[key] = typeof saved[key] === 'string' ? saved[key] : SITE_CONTENT_DEFAULTS[key];
  }
  return content;
}

function getSiteContentSchema() {
  return SITE_CONTENT_SECTIONS;
}

// `changes` holds only the fields being edited. null resets a field to its default.
async function updateSiteContent(adminId, changes) {
  const fields = new Map(SITE_CONTENT_FIELDS.map((f) => [f.key, f]));
  for (const [key, value] of Object.entries(changes)) {
    const field = fields.get(key);
    if (!field) throw new AppError(`Unknown content field: ${key}`, 400, 'INVALID_CONTENT_FIELD');
    if (value !== null && typeof value !== 'string') throw new AppError(`${field.label} must be text`, 400, 'VALIDATION_ERROR');
    if (typeof value === 'string' && value.length > field.max) {
      throw new AppError(`${field.label} must be ${field.max} characters or fewer`, 400, 'VALIDATION_ERROR');
    }
  }

  const saved = await readSavedContent();
  const next = { ...saved };
  for (const [key, value] of Object.entries(changes)) {
    if (value === null) delete next[key];
    else next[key] = field_trim(value);
  }

  await prisma.$transaction(async (tx) => {
    const row = await tx.siteSetting.upsert({
      where: { settingKey: SITE_CONTENT_KEY },
      create: { settingKey: SITE_CONTENT_KEY, settingValue: JSON.stringify(next), updatedBy: adminId },
      update: { settingValue: JSON.stringify(next), updatedBy: adminId },
    });
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'content_updated', targetType: 'site_content', targetId: row.id,
        previousValue: Object.fromEntries(Object.keys(changes).map((k) => [k, saved[k] ?? null])),
        newValue: changes,
      },
    });
  });

  return getSiteContent();
}

// Trim each line's trailing spaces but keep deliberate line breaks
function field_trim(value) {
  return value.replace(/[ \t]+$/gm, '').trim();
}

// ─── CMS PAGES ────────────────────────────────────────────────────────────────

// The site's info pages. A page with no saved content shows its built-in copy.
const CMS_PAGES = [
  { slug: 'how-it-works', title: 'How It Works' },
  { slug: 'shipping', title: 'Shipping' },
  { slug: 'safety-tips', title: 'Safety Tips' },
  { slug: 'seller-guide', title: 'Seller Guide' },
  { slug: 'fees-pricing', title: 'Fees & Pricing' },
  { slug: 'contact', title: 'Contact' },
  { slug: 'privacy', title: 'Privacy Policy' },
  { slug: 'terms', title: 'Terms & Conditions' },
];

const CMS_SLUGS = new Set(CMS_PAGES.map((p) => p.slug));

function assertCmsSlug(slug) {
  if (!CMS_SLUGS.has(slug)) throw new AppError('Page not found', 404, 'NOT_FOUND');
}

async function getPage(slug) {
  assertCmsSlug(slug);
  const page = await prisma.cmsPage.findUnique({
    where: { slug },
    select: { slug: true, title: true, content: true, metaTitle: true, metaDescription: true, updatedAt: true },
  });
  if (!page || !page.content.trim()) throw new AppError('Page not found', 404, 'NOT_FOUND');
  return page;
}

async function listPagesAdmin() {
  const saved = await prisma.cmsPage.findMany({
    select: { slug: true, title: true, content: true, metaTitle: true, metaDescription: true, updatedAt: true, updatedBy: { select: { username: true } } },
  });
  const bySlug = new Map(saved.map((p) => [p.slug, p]));
  return CMS_PAGES.map((p) => {
    const page = bySlug.get(p.slug);
    return {
      slug: p.slug,
      defaultTitle: p.title,
      title: page?.title ?? p.title,
      content: page?.content ?? '',
      metaTitle: page?.metaTitle ?? null,
      metaDescription: page?.metaDescription ?? null,
      isCustomised: Boolean(page?.content?.trim()),
      updatedAt: page?.updatedAt ?? null,
      updatedBy: page?.updatedBy?.username ?? null,
    };
  });
}

async function savePage(slug, adminId, { title, content, metaTitle, metaDescription }) {
  assertCmsSlug(slug);
  const data = { title, content, metaTitle: metaTitle || null, metaDescription: metaDescription || null, updatedById: adminId };
  return prisma.$transaction(async (tx) => {
    const page = await tx.cmsPage.upsert({ where: { slug }, create: { slug, ...data }, update: data });
    await tx.auditLog.create({
      data: { adminId, actionType: 'content_updated', targetType: 'cms_page', targetId: page.id, newValue: { slug, title } },
    });
    return page;
  });
}

// Back to the built-in copy
async function resetPage(slug, adminId) {
  assertCmsSlug(slug);
  const page = await prisma.cmsPage.findUnique({ where: { slug } });
  if (!page) return;
  await prisma.$transaction(async (tx) => {
    await tx.cmsPage.delete({ where: { slug } });
    await tx.auditLog.create({
      data: { adminId, actionType: 'content_updated', targetType: 'cms_page', targetId: page.id, previousValue: { slug, title: page.title }, newValue: { reset: true } },
    });
  });
}

// ─── BLOG ─────────────────────────────────────────────────────────────────────

const WORDS_PER_MINUTE = 220;

function readingMinutes(content) {
  const words = (content || '').replace(/[#>*_`[\]()!-]/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const POST_LIST_SELECT = {
  id: true, title: true, slug: true, excerpt: true, coverImageUrl: true, status: true, publishedAt: true,
  createdAt: true, updatedAt: true, viewCount: true, content: true,
  author: { select: { username: true, displayName: true, avatarUrl: true } },
  category: { select: { id: true, name: true, slug: true } },
  tags: { select: { tag: { select: { id: true, name: true, slug: true } } } },
};

// `rawExcerpt` is for the admin editor, which must not save the generated excerpt back
function shapePost(post, { withContent = false, rawExcerpt = false } = {}) {
  const { content, tags, author, ...rest } = post;
  return {
    ...rest,
    ...(withContent ? { content } : {}),
    // Auto excerpt when none was written
    excerpt: rawExcerpt ? rest.excerpt : (rest.excerpt || plainText(content).slice(0, 200)),
    readingMinutes: readingMinutes(content),
    author: author ? { displayName: author.displayName || author.username, avatarUrl: author.avatarUrl } : null,
    tags: tags.map((t) => t.tag),
  };
}

function plainText(markdown) {
  return (markdown || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

const publishedWhere = () => ({ status: 'published', publishedAt: { lte: new Date() } });

async function listPublishedPosts({ page = 1, pageSize = 9, category, tag, search } = {}) {
  const where = {
    ...publishedWhere(),
    ...(category ? { category: { slug: category } } : {}),
    ...(tag ? { tags: { some: { tag: { slug: tag } } } } : {}),
    ...(search ? { OR: [{ title: { contains: search, mode: 'insensitive' } }, { excerpt: { contains: search, mode: 'insensitive' } }] } : {}),
  };
  const [posts, total, categoryRow, tagRow] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { publishedAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, select: POST_LIST_SELECT }),
    prisma.blogPost.count({ where }),
    category ? prisma.blogCategory.findUnique({ where: { slug: category }, select: { id: true, name: true, slug: true, description: true } }) : null,
    tag ? prisma.blogTag.findUnique({ where: { slug: tag }, select: { id: true, name: true, slug: true } }) : null,
  ]);
  if (category && !categoryRow) throw new AppError('Category not found', 404, 'NOT_FOUND');
  if (tag && !tagRow) throw new AppError('Tag not found', 404, 'NOT_FOUND');

  return {
    posts: posts.map((p) => shapePost(p)),
    category: categoryRow,
    tag: tagRow,
    pagination: { page, pageSize, totalResults: total, totalPages: Math.ceil(total / pageSize) },
  };
}

async function getPublishedPost(slug) {
  const post = await prisma.blogPost.findFirst({
    where: { slug, ...publishedWhere() },
    select: { ...POST_LIST_SELECT, metaTitle: true, metaDescription: true },
  });
  if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');

  prisma.blogPost.update({ where: { id: post.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});

  const tagIds = post.tags.map((t) => t.tag.id);
  const related = !post.category && !tagIds.length ? [] : await prisma.blogPost.findMany({
    where: {
      ...publishedWhere(),
      id: { not: post.id },
      OR: [
        ...(post.category ? [{ categoryId: post.category.id }] : []),
        ...(tagIds.length ? [{ tags: { some: { tagId: { in: tagIds } } } }] : []),
      ],
    },
    orderBy: { publishedAt: 'desc' },
    take: 3,
    select: POST_LIST_SELECT,
  });
  // Fall back to the latest posts when nothing is related
  const relatedPosts = related.length ? related : await prisma.blogPost.findMany({
    where: { ...publishedWhere(), id: { not: post.id } }, orderBy: { publishedAt: 'desc' }, take: 3, select: POST_LIST_SELECT,
  });

  return { post: shapePost(post, { withContent: true }), related: relatedPosts.map((p) => shapePost(p)) };
}

// Every category is listed (with its post count) so new ones are visible straight away
async function listBlogCategories({ includeEmpty = true } = {}) {
  const categories = await prisma.blogCategory.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, description: true, _count: { select: { posts: { where: publishedWhere() } } } },
  });
  return categories
    .map(({ _count, ...c }) => ({ ...c, postCount: _count.posts }))
    .filter((c) => includeEmpty || c.postCount > 0);
}

async function listBlogTags({ includeEmpty = false } = {}) {
  const tags = await prisma.blogTag.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, _count: { select: { posts: { where: { post: publishedWhere() } } } } },
  });
  return tags
    .map(({ _count, ...t }) => ({ ...t, postCount: _count.posts }))
    .filter((t) => includeEmpty || t.postCount > 0);
}

// ─── Blog admin ───────────────────────────────────────────────────────────────

async function uniquePostSlug(base, excludeId) {
  const root = slugify(base) || 'post';
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await prisma.blogPost.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}

async function resolveTags(names = []) {
  // First spelling wins when the same tag is entered twice
  const bySlug = new Map();
  for (const name of names.map((n) => n.trim()).filter(Boolean)) {
    const slug = slugify(name);
    if (slug && !bySlug.has(slug)) bySlug.set(slug, name);
  }
  const unique = [...bySlug.entries()];
  const tags = [];
  for (const [slug, name] of unique) {
    const tag = await prisma.blogTag.upsert({ where: { slug }, create: { name, slug }, update: {} })
      .catch(async (err) => {
        // Same name with different case already exists under another slug
        if (err.code === 'P2002') return prisma.blogTag.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } });
        throw err;
      });
    if (tag) tags.push(tag);
  }
  return tags;
}

async function listPostsAdmin({ status, search, page = 1, pageSize = 20 } = {}) {
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { title: { contains: search, mode: 'insensitive' } } : {}),
  };
  const [posts, total] = await Promise.all([
    prisma.blogPost.findMany({ where, orderBy: { updatedAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, select: POST_LIST_SELECT }),
    prisma.blogPost.count({ where }),
  ]);
  return {
    posts: posts.map((p) => shapePost(p)),
    pagination: { page, pageSize, totalResults: total, totalPages: Math.ceil(total / pageSize) },
  };
}

async function getPostAdmin(id) {
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { ...POST_LIST_SELECT, metaTitle: true, metaDescription: true } });
  if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');
  return shapePost(post, { withContent: true, rawExcerpt: true });
}

async function assertCategory(categoryId) {
  if (!categoryId) return;
  const exists = await prisma.blogCategory.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!exists) throw new AppError('Category not found', 400, 'INVALID_CATEGORY');
}

async function savePost(adminId, id, input) {
  const existing = id ? await prisma.blogPost.findUnique({ where: { id }, select: { id: true, status: true, publishedAt: true, slug: true, content: true } }) : null;
  if (id && !existing) throw new AppError('Post not found', 404, 'NOT_FOUND');
  await assertCategory(input.categoryId);

  const data = {};
  for (const key of ['title', 'excerpt', 'content', 'coverImageUrl', 'metaTitle', 'metaDescription', 'categoryId', 'status']) {
    if (input[key] !== undefined) data[key] = input[key] === '' ? null : input[key];
  }
  if (data.content === null) data.content = '';

  if (input.slug !== undefined || !existing) {
    const wanted = input.slug || input.title || existing?.slug;
    data.slug = await uniquePostSlug(wanted, id);
  }

  // First publish stamps the date; an explicit date lets admins schedule or backdate
  const status = data.status ?? existing?.status ?? 'draft';
  if (input.publishedAt !== undefined) data.publishedAt = input.publishedAt;
  else if (status === 'published' && !existing?.publishedAt) data.publishedAt = new Date();
  if (status === 'published' && !(data.content ?? existing?.content ?? '').trim()) {
    throw new AppError('Add some content before publishing', 400, 'VALIDATION_ERROR');
  }

  const tags = input.tags !== undefined ? await resolveTags(input.tags) : null;

  const post = await prisma.$transaction(async (tx) => {
    const saved = existing
      ? await tx.blogPost.update({ where: { id }, data })
      : await tx.blogPost.create({ data: { ...data, authorId: adminId } });
    if (tags) {
      await tx.blogPostTag.deleteMany({ where: { postId: saved.id } });
      if (tags.length) await tx.blogPostTag.createMany({ data: tags.map((t) => ({ postId: saved.id, tagId: t.id })) });
    }
    await tx.auditLog.create({
      data: {
        adminId, actionType: 'blog_post_saved', targetType: 'blog_post', targetId: saved.id,
        previousValue: existing ? { status: existing.status, slug: existing.slug } : undefined,
        newValue: { title: saved.title, slug: saved.slug, status: saved.status },
      },
    });
    return saved;
  });

  return getPostAdmin(post.id);
}

async function deletePost(adminId, id) {
  const post = await prisma.blogPost.findUnique({ where: { id }, select: { id: true, title: true, slug: true } });
  if (!post) throw new AppError('Post not found', 404, 'NOT_FOUND');
  await prisma.$transaction(async (tx) => {
    await tx.blogPost.delete({ where: { id } });
    await tx.auditLog.create({
      data: { adminId, actionType: 'blog_post_deleted', targetType: 'blog_post', targetId: id, previousValue: { title: post.title, slug: post.slug } },
    });
  });
}

async function saveCategory(id, { name, description }) {
  const slug = slugify(name);
  if (!slug) throw new AppError('Enter a valid category name', 400, 'VALIDATION_ERROR');
  const clash = await prisma.blogCategory.findFirst({ where: { OR: [{ slug }, { name: { equals: name, mode: 'insensitive' } }], ...(id ? { id: { not: id } } : {}) } });
  if (clash) throw new AppError('A category with this name already exists', 409, 'CATEGORY_EXISTS');
  const data = { name, slug, description: description || null };
  if (id) {
    const exists = await prisma.blogCategory.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new AppError('Category not found', 404, 'NOT_FOUND');
    return prisma.blogCategory.update({ where: { id }, data });
  }
  return prisma.blogCategory.create({ data });
}

// Posts in a deleted category become uncategorised (FK is SET NULL)
async function deleteCategory(id) {
  const exists = await prisma.blogCategory.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new AppError('Category not found', 404, 'NOT_FOUND');
  await prisma.blogCategory.delete({ where: { id } });
}

async function renameTag(id, name) {
  const slug = slugify(name);
  if (!slug) throw new AppError('Enter a valid tag name', 400, 'VALIDATION_ERROR');
  const clash = await prisma.blogTag.findFirst({ where: { slug, id: { not: id } } });
  if (clash) throw new AppError('A tag with this name already exists', 409, 'TAG_EXISTS');
  const exists = await prisma.blogTag.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new AppError('Tag not found', 404, 'NOT_FOUND');
  return prisma.blogTag.update({ where: { id }, data: { name, slug } });
}

async function deleteTag(id) {
  const exists = await prisma.blogTag.findUnique({ where: { id }, select: { id: true } });
  if (!exists) throw new AppError('Tag not found', 404, 'NOT_FOUND');
  await prisma.blogTag.delete({ where: { id } });
}

module.exports = {
  slugify,
  // Site content
  getSiteContent, getSiteContentSchema, updateSiteContent,
  // Pages
  CMS_PAGES, getPage, listPagesAdmin, savePage, resetPage,
  // Blog (public)
  listPublishedPosts, getPublishedPost, listBlogCategories, listBlogTags,
  // Blog (admin)
  listPostsAdmin, getPostAdmin, savePost, deletePost, saveCategory, deleteCategory, renameTag, deleteTag,
};
