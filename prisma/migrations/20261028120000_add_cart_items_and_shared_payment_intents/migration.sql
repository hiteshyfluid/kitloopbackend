-- Shopping cart
CREATE TABLE IF NOT EXISTS "cart_items" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_cart_items_user_listing" ON "cart_items"("user_id", "listing_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_user_id" ON "cart_items"("user_id");
CREATE INDEX IF NOT EXISTS "idx_cart_items_listing_id" ON "cart_items"("listing_id");

DO $$ BEGIN
  ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Cart checkout: one Stripe PaymentIntent / charge can pay for several orders,
-- so these columns become plain (non-unique) indexes.
DROP INDEX IF EXISTS "payments_stripe_payment_intent_id_key";
DROP INDEX IF EXISTS "payments_stripe_charge_id_key";
CREATE INDEX IF NOT EXISTS "idx_payments_stripe_payment_intent_id" ON "payments"("stripe_payment_intent_id");
CREATE INDEX IF NOT EXISTS "idx_payments_stripe_charge_id" ON "payments"("stripe_charge_id");
