const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const content = require('../services/contentService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const UUID = z.string().uuid('Invalid id');
const idParam = (req) => validate(z.object({ id: UUID }), req.params).id;

// ─── Public ──────────────────────────────────────────────────────────────────

// Admin edits should show straight away: browsers revalidate (cheap 304 via ETag)
const REVALIDATE = 'no-cache';

// GET /api/content — editable site copy (homepage, header strip, footer)
const getSiteContent = catchAsync(async (req, res) => {
  res.set('Cache-Control', REVALIDATE);
  sendSuccess(res, 200, { content: await content.getSiteContent() });
});

// GET /api/pages/:slug — 404 when the page still uses its built-in copy
const getPage = catchAsync(async (req, res) => {
  res.set('Cache-Control', REVALIDATE);
  sendSuccess(res, 200, { page: await content.getPage(req.params.slug) });
});

const blogListSchema = z.object({
  page:      z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(50).default(9),
  category:  z.string().trim().max(80).optional(),
  tag:       z.string().trim().max(60).optional(),
  q:         z.string().trim().max(100).optional(),
});

// GET /api/blog/posts?category=&tag=&q=&page=
const listPosts = catchAsync(async (req, res) => {
  const { page, page_size, category, tag, q } = validate(blogListSchema, req.query);
  const result = await content.listPublishedPosts({ page, pageSize: page_size, category, tag, search: q || undefined });
  sendSuccess(res, 200, result);
});

// GET /api/blog/posts/:slug
const getPost = catchAsync(async (req, res) => {
  sendSuccess(res, 200, await content.getPublishedPost(req.params.slug));
});

// GET /api/blog/categories
const listCategories = catchAsync(async (req, res) => {
  res.set('Cache-Control', REVALIDATE);
  sendSuccess(res, 200, { categories: await content.listBlogCategories() });
});

// GET /api/blog/tags
const listTags = catchAsync(async (req, res) => {
  res.set('Cache-Control', REVALIDATE);
  sendSuccess(res, 200, { tags: await content.listBlogTags() });
});

// ─── Admin: site content ─────────────────────────────────────────────────────

// GET /api/admin/content — form definition + current values
const adminGetSiteContent = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { sections: content.getSiteContentSchema(), content: await content.getSiteContent() });
});

// PUT /api/admin/content  { content: { hero_title: '…', sell_title: null } }
const adminUpdateSiteContent = catchAsync(async (req, res) => {
  const { content: changes } = validate(z.object({ content: z.record(z.string(), z.string().nullable()) }), req.body);
  sendSuccess(res, 200, { content: await content.updateSiteContent(req.user.id, changes) });
});

// ─── Admin: pages ────────────────────────────────────────────────────────────

const pageSchema = z.object({
  title:            z.string().trim().min(2, 'Title is required').max(150),
  content:          z.string().max(100_000, 'Content is too long').default(''),
  meta_title:       z.string().trim().max(150).nullable().optional(),
  meta_description: z.string().trim().max(300).nullable().optional(),
});

const adminListPages = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { pages: await content.listPagesAdmin() });
});

const adminSavePage = catchAsync(async (req, res) => {
  const body = validate(pageSchema, req.body);
  const page = await content.savePage(req.params.slug, req.user.id, {
    title: body.title, content: body.content, metaTitle: body.meta_title, metaDescription: body.meta_description,
  });
  sendSuccess(res, 200, { page });
});

const adminResetPage = catchAsync(async (req, res) => {
  await content.resetPage(req.params.slug, req.user.id);
  sendSuccess(res, 200, { message: 'Page reset to its built-in content' });
});

// ─── Admin: blog ─────────────────────────────────────────────────────────────

const postSchema = z.object({
  title:            z.string().trim().min(3, 'Title must be at least 3 characters').max(200),
  slug:             z.string().trim().max(200).regex(/^[a-z0-9-]*$/, 'Slug can only use lowercase letters, numbers and hyphens').optional(),
  excerpt:          z.string().trim().max(500).nullable().optional(),
  content:          z.string().max(200_000, 'Content is too long').optional(),
  cover_image_url:  z.string().trim().url('Cover image must be a URL').max(2000).nullable().optional().or(z.literal('')),
  status:           z.enum(['draft', 'published']).optional(),
  category_id:      UUID.nullable().optional().or(z.literal('')),
  tags:             z.array(z.string().trim().min(1).max(60)).max(20).optional(),
  meta_title:       z.string().trim().max(150).nullable().optional(),
  meta_description: z.string().trim().max(300).nullable().optional(),
  published_at:     z.coerce.date().nullable().optional(),
});

function toPostInput(body) {
  return {
    title: body.title,
    slug: body.slug,
    excerpt: body.excerpt,
    content: body.content,
    coverImageUrl: body.cover_image_url,
    status: body.status,
    categoryId: body.category_id,
    tags: body.tags,
    metaTitle: body.meta_title,
    metaDescription: body.meta_description,
    publishedAt: body.published_at,
  };
}

const adminListPosts = catchAsync(async (req, res) => {
  const { status, search, page, page_size } = validate(z.object({
    status:    z.enum(['draft', 'published']).optional(),
    search:    z.string().trim().max(100).optional(),
    page:      z.coerce.number().int().min(1).default(1),
    page_size: z.coerce.number().int().min(1).max(100).default(20),
  }), req.query);
  sendSuccess(res, 200, await content.listPostsAdmin({ status, search: search || undefined, page, pageSize: page_size }));
});

const adminGetPost = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { post: await content.getPostAdmin(idParam(req)) });
});

const adminCreatePost = catchAsync(async (req, res) => {
  const body = validate(postSchema, req.body);
  sendSuccess(res, 201, { post: await content.savePost(req.user.id, null, toPostInput(body)) });
});

const adminUpdatePost = catchAsync(async (req, res) => {
  const id = idParam(req);
  const body = validate(postSchema.partial(), req.body);
  sendSuccess(res, 200, { post: await content.savePost(req.user.id, id, toPostInput(body)) });
});

const adminDeletePost = catchAsync(async (req, res) => {
  await content.deletePost(req.user.id, idParam(req));
  sendSuccess(res, 200, { message: 'Post deleted' });
});

const categorySchema = z.object({
  name:        z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
  description: z.string().trim().max(300).nullable().optional(),
});

const adminListCategories = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { categories: await content.listBlogCategories({ includeEmpty: true }) });
});

const adminCreateCategory = catchAsync(async (req, res) => {
  const body = validate(categorySchema, req.body);
  sendSuccess(res, 201, { category: await content.saveCategory(null, body) });
});

const adminUpdateCategory = catchAsync(async (req, res) => {
  const id = idParam(req);
  const body = validate(categorySchema, req.body);
  sendSuccess(res, 200, { category: await content.saveCategory(id, body) });
});

const adminDeleteCategory = catchAsync(async (req, res) => {
  await content.deleteCategory(idParam(req));
  sendSuccess(res, 200, { message: 'Category deleted' });
});

const adminListTags = catchAsync(async (req, res) => {
  sendSuccess(res, 200, { tags: await content.listBlogTags({ includeEmpty: true }) });
});

const adminRenameTag = catchAsync(async (req, res) => {
  const id = idParam(req);
  const { name } = validate(z.object({ name: z.string().trim().min(1).max(60) }), req.body);
  sendSuccess(res, 200, { tag: await content.renameTag(id, name) });
});

const adminDeleteTag = catchAsync(async (req, res) => {
  await content.deleteTag(idParam(req));
  sendSuccess(res, 200, { message: 'Tag deleted' });
});

module.exports = {
  getSiteContent, getPage, listPosts, getPost, listCategories, listTags,
  adminGetSiteContent, adminUpdateSiteContent,
  adminListPages, adminSavePage, adminResetPage,
  adminListPosts, adminGetPost, adminCreatePost, adminUpdatePost, adminDeletePost,
  adminListCategories, adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminListTags, adminRenameTag, adminDeleteTag,
};
