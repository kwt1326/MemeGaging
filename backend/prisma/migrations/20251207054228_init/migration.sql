/*
  Warnings:

  - A unique constraint covering the columns `[creator_id]` on the table `score` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "score_creator_id_key" ON "score"("creator_id");
