-- CreateTable
CREATE TABLE "score" (
    "id" SERIAL NOT NULL,
    "creator_id" INTEGER NOT NULL,
    "engagement_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "view_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "follow_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "tip_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meme_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "replies" INTEGER NOT NULL DEFAULT 0,
    "reposts" INTEGER NOT NULL DEFAULT 0,
    "quotes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "followers" INTEGER NOT NULL DEFAULT 0,
    "tip_count" INTEGER NOT NULL DEFAULT 0,
    "tip_amount" TEXT NOT NULL DEFAULT '0',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "score_creator_id_created_at_idx" ON "score"("creator_id", "created_at");

-- CreateIndex
CREATE INDEX "score_meme_score_idx" ON "score"("meme_score");

-- AddForeignKey
ALTER TABLE "score" ADD CONSTRAINT "score_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
