/*
  Warnings:

  - The primary key for the `creator` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `avatar_url` on the `creator` table. All the data in the column will be lost.
  - You are about to drop the column `handle` on the `creator` table. All the data in the column will be lost.
  - The `id` column on the `creator` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `tip` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `tip` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `from_creator_id` column on the `tip` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[memex_user_id]` on the table `creator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tx_hash]` on the table `tip` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `access_token` to the `creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `memex_user_id` to the `creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_name` to the `creator` table without a default value. This is not possible if the table is not empty.
  - Added the required column `wallet_address` to the `creator` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `to_creator_id` on the `tip` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "tip" DROP CONSTRAINT "tip_from_creator_id_fkey";

-- DropForeignKey
ALTER TABLE "tip" DROP CONSTRAINT "tip_to_creator_id_fkey";

-- DropIndex
DROP INDEX "creator_handle_key";

-- AlterTable
ALTER TABLE "creator" DROP CONSTRAINT "creator_pkey",
DROP COLUMN "avatar_url",
DROP COLUMN "handle",
ADD COLUMN     "access_token" TEXT NOT NULL,
ADD COLUMN     "memex_user_id" INTEGER NOT NULL,
ADD COLUMN     "user_name" TEXT NOT NULL,
ADD COLUMN     "user_name_tag" TEXT,
ADD COLUMN     "wallet_address" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "creator_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "tip" DROP CONSTRAINT "tip_pkey",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "from_creator_id",
ADD COLUMN     "from_creator_id" INTEGER,
DROP COLUMN "to_creator_id",
ADD COLUMN     "to_creator_id" INTEGER NOT NULL,
ADD CONSTRAINT "tip_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_memex_user_id_key" ON "creator"("memex_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "tip_tx_hash_key" ON "tip"("tx_hash");

-- AddForeignKey
ALTER TABLE "tip" ADD CONSTRAINT "tip_from_creator_id_fkey" FOREIGN KEY ("from_creator_id") REFERENCES "creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip" ADD CONSTRAINT "tip_to_creator_id_fkey" FOREIGN KEY ("to_creator_id") REFERENCES "creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
