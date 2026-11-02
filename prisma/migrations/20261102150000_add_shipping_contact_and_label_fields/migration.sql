-- Seller ship-from address / contact (private)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "full_name" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" VARCHAR(20);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_line1" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_line2" VARCHAR(100);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_city" VARCHAR(60);
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "address_postcode" VARCHAR(10);

-- Order recipient contact
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_name" VARCHAR(100);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "delivery_phone" VARCHAR(20);

-- Order courier shipment / label
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_courier" VARCHAR(40);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_service_id" VARCHAR(60);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "shipping_reference" VARCHAR(100);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "label_key" VARCHAR(255);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "label_url" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "label_created_at" TIMESTAMP(3);
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "tracking_url" TEXT;
