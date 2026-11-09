-- No máximo um caixa aberto e uma Venda em andamento por operador. As
-- verificações em CashRegisterService.open e SalesService.open dão a mensagem;
-- estes índices parciais garantem a regra mesmo com requisições simultâneas.
-- (Índices parciais não são expressáveis no schema.prisma — ver comentários lá.)

-- Vendas em andamento duplicadas (não deveriam existir) ficam só a mais recente;
-- as outras viram canceladas, que não têm efeito em estoque nem valores.
UPDATE "sale" AS s
SET "status" = 'CANCELLED', "cancelledAt" = now()
WHERE s."status" = 'IN_PROGRESS'
  AND EXISTS (
    SELECT 1 FROM "sale" AS newer
    WHERE newer."operatorId" = s."operatorId"
      AND newer."status" = 'IN_PROGRESS'
      AND (newer."openedAt", newer."id") > (s."openedAt", s."id")
  );

-- Caixas abertos duplicados (não deveriam existir) ficam só o mais recente; os
-- outros são fechados como em CashRegisterService.close, com o saldo esperado
-- calculado como em expectedCashBalance (abertura + suprimentos − sangrias ±
-- movimentos em dinheiro). Sem contagem, saldo contado e diferença ficam nulos.
UPDATE "cash_register" AS r
SET "status" = 'CLOSED',
    "closedAt" = now(),
    "expectedBalance" = r."openingBalance" + COALESCE((
      SELECT SUM(CASE
        WHEN m."type" = 'FLOAT' THEN m."amount"
        WHEN m."type" = 'PULL' THEN -m."amount"
        WHEN m."paymentMethod" IS DISTINCT FROM 'CASH' THEN 0
        WHEN m."type" = 'INFLOW' THEN m."amount"
        ELSE -m."amount"
      END)
      FROM "cash_movement" AS m
      WHERE m."cashRegisterId" = r."id"
    ), 0),
    "countedBalance" = NULL,
    "difference" = NULL,
    "note" = 'Fechado automaticamente: havia mais de um caixa aberto'
WHERE r."status" = 'OPEN'
  AND EXISTS (
    SELECT 1 FROM "cash_register" AS newer
    WHERE newer."status" = 'OPEN'
      AND (newer."openedAt", newer."id") > (r."openedAt", r."id")
  );

CREATE UNIQUE INDEX "cash_register_single_open_key"
  ON "cash_register" ("status") WHERE "status" = 'OPEN';

CREATE UNIQUE INDEX "sale_single_in_progress_per_operator_key"
  ON "sale" ("operatorId") WHERE "status" = 'IN_PROGRESS';
