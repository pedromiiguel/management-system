-- Estornar (venda concluída) ganha status próprio, separado de Cancelar.
-- O valor novo só pode ser usado depois do commit, por isso o backfill fica
-- na migração seguinte.
ALTER TYPE "SaleStatus" ADD VALUE 'VOIDED';

ALTER TABLE "sale" ADD COLUMN "voidedAt" TIMESTAMP(3);

-- Categorias do sistema passam a ser achadas por código estável, não pelo nome.
CREATE TYPE "SystemCategory" AS ENUM ('SALES', 'RECEIVABLE_SETTLEMENT');

ALTER TABLE "financial_category" ADD COLUMN "code" "SystemCategory";

CREATE UNIQUE INDEX "financial_category_code_key" ON "financial_category"("code");
