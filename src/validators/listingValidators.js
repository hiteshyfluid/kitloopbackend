const { z } = require('zod');

const UUID = z.string().uuid('Invalid ID format');

const VALID_CONDITIONS = ['new_with_tags', 'like_new', 'good', 'fair'];
const VALID_PARCEL_SIZES = ['small', 'medium', 'large', 'oversized'];
const VALID_SORT = ['newest', 'oldest', 'price_asc', 'price_desc'];
const VALID_DESTINATIONS = ['whatsapp', 'facebook', 'x', 'imessage', 'email', 'copy_link', 'native_share', 'instagram'];
const VALID_SURFACES = ['listing_detail', 'post_publish', 'my_listings'];

const createListingSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(80, 'Title must be under 80 characters'),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1000, 'Description must be under 1000 characters'),
  sport_id: UUID,
  sub_category_id: UUID,
  brand_id: UUID,
  condition: z.string().refine((v) => VALID_CONDITIONS.includes(v), { message: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}` }),
  colour: z.string().trim().min(1, 'Colour is required').max(50, 'Colour must be under 50 characters'),
  price: z.coerce.number({ invalid_type_error: 'Price must be a number' }).min(1, 'Price must be at least £1.00').max(9999, 'Price must be under £9,999.00'),
  parcel_size: z.string().refine((v) => VALID_PARCEL_SIZES.includes(v), { message: `Parcel size must be one of: ${VALID_PARCEL_SIZES.join(', ')}` }),
});

const updateListingSchema = z.object({
  title: z.string().trim().min(5, 'Title must be at least 5 characters').max(80).optional(),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(1000).optional(),
  condition: z.string().refine((v) => VALID_CONDITIONS.includes(v), { message: `Condition must be one of: ${VALID_CONDITIONS.join(', ')}` }).optional(),
  colour: z.string().trim().min(1).max(50).optional(),
  price: z.coerce.number().min(1, 'Price must be at least £1.00').max(9999, 'Price must be under £9,999.00').optional(),
  parcel_size: z.string().refine((v) => VALID_PARCEL_SIZES.includes(v), { message: `Parcel size must be one of: ${VALID_PARCEL_SIZES.join(', ')}` }).optional(),
  video_url: z.string().url().nullable().optional(),
  photo_urls: z.array(z.string().url()).min(1, 'At least one photo is required').max(10, 'Up to 10 photos').optional(),
  sport_id: UUID.optional(),
  sub_category_id: UUID.optional(),
  brand_id: UUID.optional(),
});

const searchSchema = z.object({
  q: z.string().trim().optional(),
  sport: z.string().trim().optional(),
  sub_category: z.string().trim().optional(),
  condition: z.string().trim().optional(),
  brand: z.string().trim().optional(),
  colour: z.string().trim().optional(),
  price_min: z.coerce.number().min(0).optional(),
  price_max: z.coerce.number().min(0).optional(),
  sort: z.string().refine((v) => VALID_SORT.includes(v), { message: `Sort must be one of: ${VALID_SORT.join(', ')}` }).default('newest'),
  featured: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

const shareSchema = z.object({
  destination: z.string().refine((v) => VALID_DESTINATIONS.includes(v), { message: `Destination must be one of: ${VALID_DESTINATIONS.join(', ')}` }),
  surface: z.string().refine((v) => VALID_SURFACES.includes(v), { message: `Surface must be one of: ${VALID_SURFACES.join(', ')}` }),
});

const myListingsSchema = z.object({
  status: z.string().refine((v) => ['draft', 'live', 'sold', 'paused', 'flagged', 'removed'].includes(v), { message: 'Invalid status filter' }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  page_size: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createListingSchema,
  updateListingSchema,
  searchSchema,
  shareSchema,
  myListingsSchema,
  paginationSchema,
};
