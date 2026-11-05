-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'published');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminActionType" ADD VALUE 'brand_added';
ALTER TYPE "AdminActionType" ADD VALUE 'brand_edited';
ALTER TYPE "AdminActionType" ADD VALUE 'content_updated';
ALTER TYPE "AdminActionType" ADD VALUE 'blog_post_saved';
ALTER TYPE "AdminActionType" ADD VALUE 'blog_post_deleted';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'listing_uploaded';
ALTER TYPE "NotificationType" ADD VALUE 'offer_accepted';
ALTER TYPE "NotificationType" ADD VALUE 'offer_declined';

-- AlterTable
ALTER TABLE "brands" ADD COLUMN     "created_by" UUID;

-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "offer_responded_at" TIMESTAMP(3),
ADD COLUMN     "offer_status" "CounterOfferStatus";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" VARCHAR(50),
ADD COLUMN     "last_name" VARCHAR(50);

-- CreateTable
CREATE TABLE "brand_categories" (
    "id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "sport_id" UUID NOT NULL,
    "sub_category_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brand_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "meta_title" VARCHAR(150),
    "meta_description" VARCHAR(300),
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "description" VARCHAR(300),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(200) NOT NULL,
    "excerpt" VARCHAR(500),
    "content" TEXT NOT NULL DEFAULT '',
    "cover_image_url" TEXT,
    "status" "BlogPostStatus" NOT NULL DEFAULT 'draft',
    "published_at" TIMESTAMP(3),
    "meta_title" VARCHAR(150),
    "meta_description" VARCHAR(300),
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "author_id" UUID,
    "category_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_tags" (
    "post_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "blog_post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateIndex
CREATE INDEX "idx_brand_categories_brand_id" ON "brand_categories"("brand_id");

-- CreateIndex
CREATE INDEX "idx_brand_categories_sport_id" ON "brand_categories"("sport_id");

-- CreateIndex
CREATE INDEX "idx_brand_categories_subcat_id" ON "brand_categories"("sub_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_name_key" ON "blog_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_categories_slug_key" ON "blog_categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_name_key" ON "blog_tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tags_slug_key" ON "blog_tags"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "idx_blog_posts_status_published" ON "blog_posts"("status", "published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_blog_posts_category_id" ON "blog_posts"("category_id");

-- CreateIndex
CREATE INDEX "idx_blog_post_tags_tag_id" ON "blog_post_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "brands" ADD CONSTRAINT "brands_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "brand_categories" ADD CONSTRAINT "brand_categories_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "blog_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "blog_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tags" ADD CONSTRAINT "blog_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "blog_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ─── Data ────────────────────────────────────────────────────────────────────

-- Split the existing single "full name" into first / last name
UPDATE "users"
SET "first_name" = LEFT(split_part(trim("full_name"), ' ', 1), 50),
    "last_name"  = NULLIF(LEFT(trim(substr(trim("full_name"), length(split_part(trim("full_name"), ' ', 1)) + 1)), 50), '')
WHERE "full_name" IS NOT NULL AND "first_name" IS NULL;

-- Buyer protection: 7% of the item price + a flat £1.00. Percentages are stored as fractions.
UPDATE "fee_config"
SET "previous_value" = "config_value", "config_value" = 0.07, "updated_at" = CURRENT_TIMESTAMP,
    "description" = 'Buyer protection fee — percentage of the item price'
WHERE "config_key" = 'buyer_protection_fee_percentage';

INSERT INTO "fee_config" ("id", "config_key", "config_value", "config_type", "description", "created_at", "updated_at")
SELECT gen_random_uuid(), 'buyer_protection_fee_flat', 1.00, 'flat_amount', 'Buyer protection fee — flat amount added to every order', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "fee_config" WHERE "config_key" = 'buyer_protection_fee_flat');

INSERT INTO "fee_config" ("id", "config_key", "config_value", "config_type", "description", "created_at", "updated_at")
SELECT gen_random_uuid(), 'buyer_protection_fee_percentage', 0.07, 'percentage', 'Buyer protection fee — percentage of the item price', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "fee_config" WHERE "config_key" = 'buyer_protection_fee_percentage');

-- Netball knee pads is no longer a category
UPDATE "sub_categories" SET "status" = 'hidden', "updated_at" = CURRENT_TIMESTAMP
WHERE lower("name") = 'netball knee pads';

-- Which sports each existing brand makes kit for
INSERT INTO "brand_categories" ("id", "brand_id", "sport_id")
SELECT gen_random_uuid(), b."id", s."id"
FROM (VALUES
  ('Titleist', 'Golf'), ('Ping', 'Golf'), ('Callaway', 'Golf'), ('TaylorMade', 'Golf'),
  ('Rossignol', 'Skiing'), ('Atomic', 'Skiing'), ('Salomon', 'Skiing'), ('Salomon', 'Running'),
  ('Head', 'Skiing'), ('Head', 'Tennis'), ('Head', 'Padel'), ('Head', 'Squash'),
  ('Yonex', 'Tennis'), ('Yonex', 'Badminton'), ('Yonex', 'Squash'),
  ('Babolat', 'Tennis'), ('Babolat', 'Padel'), ('Babolat', 'Badminton'),
  ('Wilson', 'Tennis'), ('Wilson', 'Golf'), ('Wilson', 'Basketball'), ('Wilson', 'American Football'),
  ('Wilson', 'Padel'), ('Wilson', 'Badminton'), ('Wilson', 'Squash'),
  ('Arena', 'Swimming'), ('Speedo', 'Swimming'),
  ('Specialized', 'Cycling'), ('Trek', 'Cycling'), ('Giant', 'Cycling'),
  ('Everlast', 'Boxing & MMA'), ('Venum', 'Boxing & MMA'),
  ('Kookaburra', 'Cricket'), ('Gunn & Moore', 'Cricket'), ('Gray-Nicolls', 'Cricket'), ('Gray-Nicolls', 'Rugby'),
  ('Canterbury', 'Rugby'), ('Gilbert', 'Rugby'), ('Gilbert', 'Netball'),
  ('Bauer', 'Ice Hockey'), ('CCM', 'Ice Hockey'),
  ('New Balance', 'Cricket'), ('New Balance', 'Football'), ('New Balance', 'Running'), ('New Balance', 'Tennis'), ('New Balance', 'Rugby'),
  ('Adidas', 'Football'), ('Adidas', 'Rugby'), ('Adidas', 'Running'), ('Adidas', 'Tennis'), ('Adidas', 'Basketball'),
  ('Adidas', 'Cricket'), ('Adidas', 'Golf'), ('Adidas', 'Padel'), ('Adidas', 'Swimming'), ('Adidas', 'Boxing & MMA'),
  ('Adidas', 'American Football'), ('Adidas', 'Netball'),
  ('Nike', 'Football'), ('Nike', 'Basketball'), ('Nike', 'Running'), ('Nike', 'Tennis'), ('Nike', 'Golf'),
  ('Nike', 'American Football'), ('Nike', 'Rugby'), ('Nike', 'Netball'), ('Nike', 'Swimming'), ('Nike', 'Boxing & MMA'),
  ('Puma', 'Football'), ('Puma', 'Running'), ('Puma', 'Cricket'), ('Puma', 'Golf'), ('Puma', 'Rugby'),
  ('Puma', 'Basketball'), ('Puma', 'Netball'),
  ('Under Armour', 'Football'), ('Under Armour', 'Rugby'), ('Under Armour', 'Running'), ('Under Armour', 'Basketball'),
  ('Under Armour', 'American Football'), ('Under Armour', 'Golf'), ('Under Armour', 'Boxing & MMA'),
  ('Asics', 'Running'), ('Asics', 'Tennis'), ('Asics', 'Netball'), ('Asics', 'Football'), ('Asics', 'Padel'),
  ('Asics', 'Squash'), ('Asics', 'Badminton')
) AS v(brand_name, sport_name)
JOIN "brands" b ON b."name" = v.brand_name
JOIN "sports" s ON s."name" = v.sport_name
WHERE NOT EXISTS (
  SELECT 1 FROM "brand_categories" bc
  WHERE bc."brand_id" = b."id" AND bc."sport_id" = s."id" AND bc."sub_category_id" IS NULL
);
