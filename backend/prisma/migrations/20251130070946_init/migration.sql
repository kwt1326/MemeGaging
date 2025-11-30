-- CreateTable
CREATE TABLE "creator" (
    "id" TEXT NOT NULL,
    "handle" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "meme_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tip" (
    "id" TEXT NOT NULL,
    "from_creator_id" TEXT,
    "to_creator_id" TEXT NOT NULL,
    "token_address" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "creator_handle_key" ON "creator"("handle");

-- AddForeignKey
ALTER TABLE "tip" ADD CONSTRAINT "tip_from_creator_id_fkey" FOREIGN KEY ("from_creator_id") REFERENCES "creator"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tip" ADD CONSTRAINT "tip_to_creator_id_fkey" FOREIGN KEY ("to_creator_id") REFERENCES "creator"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
