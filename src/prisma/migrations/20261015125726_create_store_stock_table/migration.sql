-- CreateTable
CREATE TABLE "store_stock" (
    "id" UUID NOT NULL,
    "store_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_stock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "store_stock_product_id_idx" ON "store_stock"("product_id");

-- CreateIndex
CREATE UNIQUE INDEX "store_stock_store_id_product_id_key" ON "store_stock"("store_id", "product_id");

-- AddForeignKey
ALTER TABLE "store_stock" ADD CONSTRAINT "store_stock_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "stores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "store_stock" ADD CONSTRAINT "store_stock_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
