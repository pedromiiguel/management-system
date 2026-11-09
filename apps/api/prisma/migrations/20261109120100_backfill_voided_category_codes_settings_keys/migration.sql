-- Vendas estornadas eram gravadas como CANCELLED; só `completedAt` as distinguia.
UPDATE "sale"
SET "status" = 'VOIDED', "voidedAt" = "cancelledAt", "cancelledAt" = NULL
WHERE "status" = 'CANCELLED' AND "completedAt" IS NOT NULL;

-- Categorias do sistema: liga as existentes pelo nome antigo e cria as que
-- faltarem, para que vendas e recebimentos de fiado nunca fiquem sem categoria
-- (antes isso dependia de alguém rodar o seed).
UPDATE "financial_category" SET "code" = 'SALES', "system" = true WHERE "name" = 'Vendas';
UPDATE "financial_category" SET "code" = 'RECEIVABLE_SETTLEMENT', "system" = true
WHERE "name" = 'Recebimento de fiado';

INSERT INTO "financial_category" ("id", "name", "kind", "code", "system", "active")
SELECT gen_random_uuid()::text, 'Vendas', 'INCOME', 'SALES', true, true
WHERE NOT EXISTS (SELECT 1 FROM "financial_category" WHERE "code" = 'SALES');

INSERT INTO "financial_category" ("id", "name", "kind", "code", "system", "active")
SELECT gen_random_uuid()::text, 'Recebimento de fiado', 'INCOME', 'RECEIVABLE_SETTLEMENT', true, true
WHERE NOT EXISTS (SELECT 1 FROM "financial_category" WHERE "code" = 'RECEIVABLE_SETTLEMENT');

-- Configurações passam a ser gravadas pela chave de `SETTING_KEYS`
-- (@beverage/shared). `DEFAULT_MINIMUM_STOCK` nunca foi lido e sai.
UPDATE "setting" SET "key" = 'stockPolicy' WHERE "key" = 'STOCK_POLICY';
UPDATE "setting" SET "key" = 'revenueTargetMonthly' WHERE "key" = 'REVENUE_TARGET_MONTHLY';
UPDATE "setting" SET "key" = 'enabledPaymentMethods' WHERE "key" = 'ENABLED_PAYMENT_METHODS';
UPDATE "setting" SET "key" = 'expiryAlertDays' WHERE "key" = 'EXPIRY_ALERT_DAYS';
DELETE FROM "setting" WHERE "key" = 'DEFAULT_MINIMUM_STOCK';
