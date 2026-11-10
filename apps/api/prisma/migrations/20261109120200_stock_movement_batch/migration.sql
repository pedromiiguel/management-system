-- CreateTable
CREATE TABLE "stock_movement_batch" (
    "id" TEXT NOT NULL,
    "movementId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "stock_movement_batch_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stock_movement_batch_movementId_idx" ON "stock_movement_batch"("movementId");

-- CreateIndex
CREATE INDEX "stock_movement_batch_batchId_idx" ON "stock_movement_batch"("batchId");

-- AddForeignKey
ALTER TABLE "stock_movement_batch" ADD CONSTRAINT "stock_movement_batch_movementId_fkey" FOREIGN KEY ("movementId") REFERENCES "stock_movement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movement_batch" ADD CONSTRAINT "stock_movement_batch_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "product_batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

