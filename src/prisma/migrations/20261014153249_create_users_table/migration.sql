-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "nik" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "store_id" UUID,
    "role" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_nik_key" ON "users"("nik");

-- CreateIndex
CREATE INDEX "users_store_id_idx" ON "users"("store_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
