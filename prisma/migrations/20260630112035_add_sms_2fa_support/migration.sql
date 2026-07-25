-- CreateEnum
CREATE TYPE "TwoFactorMethod" AS ENUM ('authenticator_app', 'sms');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "two_factor_method" "TwoFactorMethod",
ADD COLUMN     "two_factor_pending_code" TEXT,
ADD COLUMN     "two_factor_pending_code_expires" TIMESTAMP(3),
ADD COLUMN     "two_factor_pending_phone" VARCHAR(20),
ADD COLUMN     "two_factor_phone" VARCHAR(20);
