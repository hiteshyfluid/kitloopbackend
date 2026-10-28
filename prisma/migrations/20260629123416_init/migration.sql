-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('buyer', 'seller', 'both', 'admin');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('active', 'suspended', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('email', 'google', 'apple');

-- CreateEnum
CREATE TYPE "SportTag" AS ENUM ('bat_ball', 'racket', 'team', 'endurance', 'snow', 'water', 'combat', 'precision');

-- CreateEnum
CREATE TYPE "VisibilityStatus" AS ENUM ('active', 'hidden');

-- CreateEnum
CREATE TYPE "ParcelSize" AS ENUM ('small', 'medium', 'large', 'oversized');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('new_with_tags', 'like_new', 'good', 'fair');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'live', 'sold', 'paused', 'flagged', 'removed');

-- CreateEnum
CREATE TYPE "FulfilmentStatus" AS ENUM ('awaiting_dispatch', 'dispatched', 'delivered', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('held', 'released', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "OrderDisputeStatus" AS ENUM ('none', 'active', 'resolved');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('card', 'apple_pay', 'google_pay');

-- CreateEnum
CREATE TYPE "StripePaymentStatus" AS ENUM ('pending', 'succeeded', 'failed', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('held', 'released', 'refunded', 'partially_refunded');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('pending', 'initiated', 'completed', 'failed');

-- CreateEnum
CREATE TYPE "OfferThreadStatus" AS ENUM ('active', 'completed', 'expired', 'closed');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('text', 'offer', 'counter_offer', 'system');

-- CreateEnum
CREATE TYPE "CounterOfferStatus" AS ENUM ('pending', 'accepted', 'declined', 'expired', 'unavailable');

-- CreateEnum
CREATE TYPE "DisputeReason" AS ENUM ('item_not_as_described', 'item_arrived_damaged', 'wrong_item_received', 'item_not_received', 'significantly_different');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('open', 'seller_responded', 'admin_reviewing', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "DisputeRuling" AS ENUM ('refund_buyer', 'release_seller', 'partial_resolution');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('order_placed', 'dispatched', 'delivered', 'dispute_raised', 'dispute_resolved', 'offer_received', 'counter_offer_received', 'counter_offer_accepted', 'counter_offer_declined', 'review_received', 'badge_granted', 'badge_revoked', 'listing_flagged', 'listing_removed', 'account_suspended', 'payout_initiated', 'payout_completed', 'price_drop');

-- CreateEnum
CREATE TYPE "AdminActionType" AS ENUM ('listing_flagged', 'listing_removed', 'listing_restored', 'user_suspended', 'user_banned', 'user_reinstated', 'dispute_ruled', 'badge_granted', 'badge_revoked', 'fee_updated', 'category_added', 'category_edited', 'category_removed', 'sport_added', 'sport_hidden');

-- CreateEnum
CREATE TYPE "BadgeAction" AS ENUM ('granted', 'revoked', 'rejected');

-- CreateEnum
CREATE TYPE "ShareDestination" AS ENUM ('whatsapp', 'facebook', 'x', 'imessage', 'email', 'copy_link', 'native_share', 'instagram');

-- CreateEnum
CREATE TYPE "ShareSurface" AS ENUM ('listing_detail', 'post_publish', 'my_listings');

-- CreateEnum
CREATE TYPE "FeeConfigType" AS ENUM ('percentage', 'flat_amount', 'boolean');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "username" VARCHAR(30) NOT NULL,
    "display_name" VARCHAR(60) NOT NULL,
    "avatar_url" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'buyer',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'active',
    "auth_provider" "AuthProvider" NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "password_hash" TEXT,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "holiday_mode" BOOLEAN NOT NULL DEFAULT false,
    "stripe_customer_id" VARCHAR(255),
    "stripe_connect_id" VARCHAR(255),
    "bank_account_last4" VARCHAR(4),
    "bank_sort_code_masked" VARCHAR(10),
    "suspension_end_date" TIMESTAMP(3),
    "suspension_reason" TEXT,
    "total_sales" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "verified_seller" BOOLEAN NOT NULL DEFAULT false,
    "violation_count" INTEGER NOT NULL DEFAULT 0,
    "last_active_at" TIMESTAMP(3),
    "notification_order_updates" BOOLEAN NOT NULL DEFAULT true,
    "notification_messages" BOOLEAN NOT NULL DEFAULT true,
    "notification_price_drops" BOOLEAN NOT NULL DEFAULT true,
    "notification_promotions" BOOLEAN NOT NULL DEFAULT false,
    "notification_disputes" BOOLEAN NOT NULL DEFAULT true,
    "preferred_sports" JSONB,
    "privacy_profile_public" BOOLEAN NOT NULL DEFAULT true,
    "privacy_data_sharing" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sports" (
    "id" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "icon_url" TEXT NOT NULL,
    "sport_tag" "SportTag" NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "VisibilityStatus" NOT NULL DEFAULT 'active',
    "seasonal_highlight" BOOLEAN NOT NULL DEFAULT false,
    "seasonal_highlight_start" TIMESTAMP(3),
    "seasonal_highlight_end" TIMESTAMP(3),
    "listing_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_categories" (
    "id" UUID NOT NULL,
    "sport_id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "recommended_parcel_size" "ParcelSize" NOT NULL,
    "is_oversized" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "VisibilityStatus" NOT NULL DEFAULT 'active',
    "listing_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sub_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "brands" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "logo_url" TEXT,
    "status" "VisibilityStatus" NOT NULL DEFAULT 'active',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "sport_id" UUID NOT NULL,
    "sub_category_id" UUID NOT NULL,
    "brand_id" UUID NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "colour" VARCHAR(50) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "parcel_size" "ParcelSize" NOT NULL,
    "shipping_fee" DECIMAL(10,2) NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "flag_reason" TEXT,
    "removal_reason" TEXT,
    "photos" JSONB NOT NULL,
    "video_url" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "wishlist_count" INTEGER NOT NULL DEFAULT 0,
    "share_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_at" TIMESTAMP(3),
    "og_image_url" TEXT,
    "published_at" TIMESTAMP(3),
    "sold_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "item_price" DECIMAL(10,2) NOT NULL,
    "shipping_fee" DECIMAL(10,2) NOT NULL,
    "buyer_protection_fee" DECIMAL(10,2) NOT NULL,
    "platform_commission" DECIMAL(10,2) NOT NULL,
    "total_amount" DECIMAL(10,2) NOT NULL,
    "seller_net_amount" DECIMAL(10,2) NOT NULL,
    "fulfilment_status" "FulfilmentStatus" NOT NULL DEFAULT 'awaiting_dispatch',
    "payment_status" "OrderPaymentStatus" NOT NULL DEFAULT 'held',
    "dispute_status" "OrderDisputeStatus" NOT NULL DEFAULT 'none',
    "tracking_number" VARCHAR(100),
    "dispatched_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "delivery_address_line1" VARCHAR(100) NOT NULL,
    "delivery_address_line2" VARCHAR(100),
    "delivery_city" VARCHAR(60) NOT NULL,
    "delivery_postcode" VARCHAR(10) NOT NULL,
    "agreed_price" DECIMAL(10,2),
    "snapshot_listing_title" VARCHAR(80) NOT NULL,
    "snapshot_condition" VARCHAR(20) NOT NULL,
    "snapshot_photos" JSONB NOT NULL,
    "dispute_window_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "stripe_payment_intent_id" VARCHAR(255) NOT NULL,
    "stripe_charge_id" VARCHAR(255),
    "stripe_transfer_id" VARCHAR(255),
    "stripe_refund_id" VARCHAR(255),
    "amount_total" DECIMAL(10,2) NOT NULL,
    "amount_item" DECIMAL(10,2) NOT NULL,
    "amount_shipping" DECIMAL(10,2) NOT NULL,
    "amount_buyer_protection" DECIMAL(10,2) NOT NULL,
    "amount_commission" DECIMAL(10,2) NOT NULL,
    "amount_seller_payout" DECIMAL(10,2) NOT NULL,
    "amount_refunded" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'GBP',
    "payment_method" "PaymentMethod" NOT NULL,
    "payment_status" "StripePaymentStatus" NOT NULL,
    "escrow_status" "EscrowStatus" NOT NULL DEFAULT 'held',
    "payout_status" "PayoutStatus",
    "payout_initiated_at" TIMESTAMP(3),
    "payout_completed_at" TIMESTAMP(3),
    "refund_reason" TEXT,
    "shipping_fee_refunded" BOOLEAN NOT NULL DEFAULT false,
    "stripe_webhook_events" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "status" "OfferThreadStatus" NOT NULL DEFAULT 'active',
    "last_message_at" TIMESTAMP(3),
    "last_message_preview" VARCHAR(60),
    "buyer_unread_count" INTEGER NOT NULL DEFAULT 0,
    "seller_unread_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "message_type" "MessageType" NOT NULL DEFAULT 'text',
    "body" TEXT,
    "offer_amount" DECIMAL(10,2),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "block_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "counter_offers" (
    "id" UUID NOT NULL,
    "offer_id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "counter_amount" DECIMAL(10,2) NOT NULL,
    "original_price" DECIMAL(10,2) NOT NULL,
    "status" "CounterOfferStatus" NOT NULL DEFAULT 'pending',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "checkout_price_lock_expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "counter_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "buyer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence_photos" JSONB,
    "seller_response" TEXT,
    "seller_evidence_photos" JSONB,
    "seller_responded_at" TIMESTAMP(3),
    "seller_response_deadline" TIMESTAMP(3) NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'open',
    "admin_id" UUID,
    "ruling" "DisputeRuling",
    "ruling_reason" TEXT,
    "refund_amount" DECIMAL(10,2),
    "seller_release_amount" DECIMAL(10,2),
    "shipping_fee_refunded" BOOLEAN NOT NULL DEFAULT false,
    "additional_evidence_requested" BOOLEAN NOT NULL DEFAULT false,
    "additional_evidence_deadline" TIMESTAMP(3),
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "reviewer_id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "body" TEXT,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "removed_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "removal_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favourites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favourites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "body" TEXT NOT NULL,
    "reference_id" UUID,
    "reference_type" VARCHAR(50),
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_in_app" BOOLEAN NOT NULL DEFAULT false,
    "sent_email" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" UUID NOT NULL,
    "admin_id" UUID NOT NULL,
    "action_type" "AdminActionType" NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" UUID NOT NULL,
    "previous_value" JSONB,
    "new_value" JSONB,
    "reason" TEXT,
    "internal_note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seller_badges" (
    "id" UUID NOT NULL,
    "seller_id" UUID NOT NULL,
    "admin_id" UUID,
    "action" "BadgeAction" NOT NULL,
    "reason" TEXT,
    "unmet_criteria" JSONB,
    "reapplication_eligible_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seller_badges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shares" (
    "id" UUID NOT NULL,
    "listing_id" UUID NOT NULL,
    "user_id" UUID,
    "destination" "ShareDestination" NOT NULL,
    "surface" "ShareSurface" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shares_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_config" (
    "id" UUID NOT NULL,
    "config_key" VARCHAR(100) NOT NULL,
    "config_value" DECIMAL(10,4) NOT NULL,
    "config_type" "FeeConfigType" NOT NULL,
    "description" TEXT NOT NULL,
    "sport_id" UUID,
    "is_promotional" BOOLEAN NOT NULL DEFAULT false,
    "promotional_start" TIMESTAMP(3),
    "promotional_end" TIMESTAMP(3),
    "previous_value" DECIMAL(10,4),
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_connect_id_key" ON "users"("stripe_connect_id");

-- CreateIndex
CREATE INDEX "idx_users_account_status" ON "users"("account_status");

-- CreateIndex
CREATE INDEX "idx_users_role" ON "users"("role");

-- CreateIndex
CREATE INDEX "idx_users_verified_seller" ON "users"("verified_seller");

-- CreateIndex
CREATE UNIQUE INDEX "sports_name_key" ON "sports"("name");

-- CreateIndex
CREATE UNIQUE INDEX "sports_slug_key" ON "sports"("slug");

-- CreateIndex
CREATE INDEX "idx_sports_status" ON "sports"("status");

-- CreateIndex
CREATE INDEX "idx_sports_display_order" ON "sports"("display_order");

-- CreateIndex
CREATE INDEX "idx_subcat_sport_id" ON "sub_categories"("sport_id");

-- CreateIndex
CREATE INDEX "idx_subcat_status" ON "sub_categories"("status");

-- CreateIndex
CREATE UNIQUE INDEX "idx_subcat_sport_slug" ON "sub_categories"("sport_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "brands_name_key" ON "brands"("name");

-- CreateIndex
CREATE UNIQUE INDEX "brands_slug_key" ON "brands"("slug");

-- CreateIndex
CREATE INDEX "idx_brands_status" ON "brands"("status");

-- CreateIndex
CREATE INDEX "idx_listings_seller_id" ON "listings"("seller_id");

-- CreateIndex
CREATE INDEX "idx_listings_sport_id" ON "listings"("sport_id");

-- CreateIndex
CREATE INDEX "idx_listings_subcat_id" ON "listings"("sub_category_id");

-- CreateIndex
CREATE INDEX "idx_listings_brand_id" ON "listings"("brand_id");

-- CreateIndex
CREATE INDEX "idx_listings_status" ON "listings"("status");

-- CreateIndex
CREATE INDEX "idx_listings_condition" ON "listings"("condition");

-- CreateIndex
CREATE INDEX "idx_listings_price" ON "listings"("price");

-- CreateIndex
CREATE INDEX "idx_listings_colour" ON "listings"("colour");

-- CreateIndex
CREATE INDEX "idx_listings_featured" ON "listings"("is_featured");

-- CreateIndex
CREATE INDEX "idx_listings_published_at" ON "listings"("published_at" DESC);

-- CreateIndex
CREATE INDEX "idx_orders_listing_id" ON "orders"("listing_id");

-- CreateIndex
CREATE INDEX "idx_orders_buyer_id" ON "orders"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_orders_seller_id" ON "orders"("seller_id");

-- CreateIndex
CREATE INDEX "idx_orders_fulfilment_status" ON "orders"("fulfilment_status");

-- CreateIndex
CREATE INDEX "idx_orders_payment_status" ON "orders"("payment_status");

-- CreateIndex
CREATE INDEX "idx_orders_dispute_status" ON "orders"("dispute_status");

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "orders"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "payments_order_id_key" ON "payments"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_charge_id_key" ON "payments"("stripe_charge_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_transfer_id_key" ON "payments"("stripe_transfer_id");

-- CreateIndex
CREATE INDEX "idx_payments_buyer_id" ON "payments"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_payments_seller_id" ON "payments"("seller_id");

-- CreateIndex
CREATE INDEX "idx_payments_payment_status" ON "payments"("payment_status");

-- CreateIndex
CREATE INDEX "idx_payments_escrow_status" ON "payments"("escrow_status");

-- CreateIndex
CREATE INDEX "idx_payments_payout_status" ON "payments"("payout_status");

-- CreateIndex
CREATE INDEX "idx_offers_listing_id" ON "offers"("listing_id");

-- CreateIndex
CREATE INDEX "idx_offers_buyer_id" ON "offers"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_offers_seller_id" ON "offers"("seller_id");

-- CreateIndex
CREATE INDEX "idx_offers_status" ON "offers"("status");

-- CreateIndex
CREATE INDEX "idx_offers_last_message_at" ON "offers"("last_message_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_offers_listing_buyer" ON "offers"("listing_id", "buyer_id");

-- CreateIndex
CREATE INDEX "idx_messages_offer_id" ON "messages"("offer_id");

-- CreateIndex
CREATE INDEX "idx_messages_sender_id" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "idx_messages_created_at" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "idx_messages_is_read" ON "messages"("is_read");

-- CreateIndex
CREATE UNIQUE INDEX "counter_offers_message_id_key" ON "counter_offers"("message_id");

-- CreateIndex
CREATE INDEX "idx_counter_offers_offer_id" ON "counter_offers"("offer_id");

-- CreateIndex
CREATE INDEX "idx_counter_offers_listing_id" ON "counter_offers"("listing_id");

-- CreateIndex
CREATE INDEX "idx_counter_offers_status" ON "counter_offers"("status");

-- CreateIndex
CREATE INDEX "idx_counter_offers_expires_at" ON "counter_offers"("expires_at");

-- CreateIndex
CREATE INDEX "idx_counter_offers_checkout_lock" ON "counter_offers"("checkout_price_lock_expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "disputes_order_id_key" ON "disputes"("order_id");

-- CreateIndex
CREATE INDEX "idx_disputes_buyer_id" ON "disputes"("buyer_id");

-- CreateIndex
CREATE INDEX "idx_disputes_seller_id" ON "disputes"("seller_id");

-- CreateIndex
CREATE INDEX "idx_disputes_status" ON "disputes"("status");

-- CreateIndex
CREATE INDEX "idx_disputes_admin_id" ON "disputes"("admin_id");

-- CreateIndex
CREATE INDEX "idx_disputes_created_at" ON "disputes"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_order_id_key" ON "reviews"("order_id");

-- CreateIndex
CREATE INDEX "idx_reviews_seller_id" ON "reviews"("seller_id");

-- CreateIndex
CREATE INDEX "idx_reviews_reviewer_id" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "idx_reviews_rating" ON "reviews"("rating");

-- CreateIndex
CREATE INDEX "idx_reviews_is_visible" ON "reviews"("is_visible");

-- CreateIndex
CREATE INDEX "idx_reviews_created_at" ON "reviews"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_favourites_user_id" ON "favourites"("user_id");

-- CreateIndex
CREATE INDEX "idx_favourites_listing_id" ON "favourites"("listing_id");

-- CreateIndex
CREATE INDEX "idx_favourites_created_at" ON "favourites"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "idx_favourites_user_listing" ON "favourites"("user_id", "listing_id");

-- CreateIndex
CREATE INDEX "idx_notifications_user_id" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "idx_notifications_type" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "idx_notifications_is_read" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "idx_notifications_created_at" ON "notifications"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_log_admin_id" ON "audit_log"("admin_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_action_type" ON "audit_log"("action_type");

-- CreateIndex
CREATE INDEX "idx_audit_log_target_type" ON "audit_log"("target_type");

-- CreateIndex
CREATE INDEX "idx_audit_log_target_id" ON "audit_log"("target_id");

-- CreateIndex
CREATE INDEX "idx_audit_log_created_at" ON "audit_log"("created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_seller_badges_seller_id" ON "seller_badges"("seller_id");

-- CreateIndex
CREATE INDEX "idx_seller_badges_action" ON "seller_badges"("action");

-- CreateIndex
CREATE INDEX "idx_seller_badges_reapply_at" ON "seller_badges"("reapplication_eligible_at");

-- CreateIndex
CREATE INDEX "idx_shares_listing_id" ON "shares"("listing_id");

-- CreateIndex
CREATE INDEX "idx_shares_user_id" ON "shares"("user_id");

-- CreateIndex
CREATE INDEX "idx_shares_destination" ON "shares"("destination");

-- CreateIndex
CREATE INDEX "idx_shares_created_at" ON "shares"("created_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "fee_config_config_key_key" ON "fee_config"("config_key");

-- CreateIndex
CREATE INDEX "idx_fee_config_sport_id" ON "fee_config"("sport_id");

-- CreateIndex
CREATE INDEX "idx_fee_config_promotional" ON "fee_config"("is_promotional");

-- CreateIndex
CREATE INDEX "idx_fee_config_promo_end" ON "fee_config"("promotional_end");

-- AddForeignKey
ALTER TABLE "sub_categories" ADD CONSTRAINT "sub_categories_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_sub_category_id_fkey" FOREIGN KEY ("sub_category_id") REFERENCES "sub_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_offer_id_fkey" FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "counter_offers" ADD CONSTRAINT "counter_offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favourites" ADD CONSTRAINT "favourites_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_badges" ADD CONSTRAINT "seller_badges_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seller_badges" ADD CONSTRAINT "seller_badges_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shares" ADD CONSTRAINT "shares_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_config" ADD CONSTRAINT "fee_config_sport_id_fkey" FOREIGN KEY ("sport_id") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fee_config" ADD CONSTRAINT "fee_config_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
