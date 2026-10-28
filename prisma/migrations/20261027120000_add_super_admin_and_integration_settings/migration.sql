-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('stripe', 'moov', 'general');

-- CreateEnum
CREATE TYPE "IntegrationEnvironment" AS ENUM ('test', 'live', 'shared');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'super_admin';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AdminActionType" ADD VALUE 'integration_settings_updated';
ALTER TYPE "AdminActionType" ADD VALUE 'integration_settings_tested';
ALTER TYPE "AdminActionType" ADD VALUE 'integration_mode_changed';

-- CreateTable
CREATE TABLE "integration_settings" (
    "id" UUID NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "environment" "IntegrationEnvironment" NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "secrets" JSONB NOT NULL DEFAULT '{}',
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integration_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "uq_integration_settings_provider_env" ON "integration_settings"("provider", "environment");

-- AddForeignKey
ALTER TABLE "integration_settings" ADD CONSTRAINT "integration_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

