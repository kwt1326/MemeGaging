/*
  Warnings:

  - Changed the type of `amount` on the `tip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "tip" DROP COLUMN "amount",
ADD COLUMN     "amount" DECIMAL(78,0) NOT NULL;
