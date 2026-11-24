-- Delivery method chosen at checkout: home (DPD) | seller (oversized, seller-arranged)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_method" VARCHAR(20);

-- Seller's label. The file (base64) contains the buyer's address, so it is
-- only served to the seller through the API, never from a public URL.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "label_format" VARCHAR(10);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "label_data" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "label_mime" VARCHAR(40);
-- Shop to home: the seller drops the parcel at a DPD Pickup shop by this date,
-- showing the QR code (DPD-12DROPQR) or the printed label.
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "drop_off_by" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "drop_off_qr" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "drop_off_qr_mime" VARCHAR(40);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "drop_off_code" VARCHAR(100);

-- Courier tracking updates (Moov webhook)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_status" VARCHAR(40);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_status_text" VARCHAR(255);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_status_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_events" JSONB;
-- When DPD leaves the parcel at a shop for the buyer to collect
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "collection_point_name" VARCHAR(150);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "collection_point_address" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "collect_by" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "collection_reminder_sent_at" TIMESTAMP(3);

-- Daily "please ship" reminders (claimed atomically so each runs once per day)
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "dispatch_reminder_count" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "last_dispatch_reminder_at" TIMESTAMP(3);

-- Automatic cancellation when the seller doesn't ship in time
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cancel_reason" VARCHAR(255);

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'order_cancelled';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'awaiting_collection';

-- Admin-editable delivery prices and timings (Admin → Fees). Home delivery
-- matches the previous built-in defaults.
INSERT INTO "fee_config" ("id", "config_key", "config_value", "config_type", "description", "updated_at")
VALUES
  (gen_random_uuid(), 'shipping_fee_small',      3.49, 'flat_amount', 'DPD home delivery price — small parcel', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'shipping_fee_medium',     5.49, 'flat_amount', 'DPD home delivery price — medium parcel', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'shipping_fee_large',      8.99, 'flat_amount', 'DPD home delivery price — large parcel', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'shipping_fee_oversized', 14.99, 'flat_amount', 'Seller-arranged delivery price — oversized items', CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'dispatch_window_days',    5,    'flat_amount', 'Days a seller has to ship after a sale — daily reminders, then the order is cancelled and refunded', CURRENT_TIMESTAMP)
ON CONFLICT ("config_key") DO NOTHING;
