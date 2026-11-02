-- SKU / variant options per sub-category (size, handedness, grade, …)
DO $$ BEGIN
  CREATE TYPE "Handedness" AS ENUM ('left', 'right');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "variant_options" (
    "id" UUID NOT NULL,
    "sub_category_id" UUID NOT NULL,
    "dimension" VARCHAR(40) NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "notes" VARCHAR(255),
    "handedness" "Handedness",
    "gender" VARCHAR(30),
    "age_group" VARCHAR(30),
    "surface" VARCHAR(60),
    "shipping_box_cm" VARCHAR(60),
    "est_weight" VARCHAR(60),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "VisibilityStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "variant_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_variant_options_subcat_dim_value" ON "variant_options"("sub_category_id", "dimension", "value");
CREATE INDEX IF NOT EXISTS "idx_variant_options_subcat_id" ON "variant_options"("sub_category_id");
CREATE INDEX IF NOT EXISTS "idx_variant_options_handedness" ON "variant_options"("handedness");

DO $$ BEGIN
  ALTER TABLE "variant_options" ADD CONSTRAINT "variant_options_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Options chosen on a listing — one per dimension
CREATE TABLE IF NOT EXISTS "listing_variants" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "variant_option_id" UUID NOT NULL,
    "dimension" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_variants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_listing_variants_listing_dim" ON "listing_variants"("listing_id", "dimension");
CREATE INDEX IF NOT EXISTS "idx_listing_variants_option_id" ON "listing_variants"("variant_option_id");

DO $$ BEGIN
  ALTER TABLE "listing_variants" ADD CONSTRAINT "listing_variants_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "listing_variants" ADD CONSTRAINT "listing_variants_variant_option_id_fkey" FOREIGN KEY ("variant_option_id") REFERENCES "variant_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
