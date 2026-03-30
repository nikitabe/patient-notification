-- AlterTable
ALTER TABLE "Advancement" ADD COLUMN     "actionable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "actionableDetails" TEXT,
ADD COLUMN     "dateOfAdvancement" TEXT;
