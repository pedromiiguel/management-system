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

CREATE UNIQUE INDEX "cash_register_single_open_key"
  ON "cash_register" ("status") WHERE "status" = 'OPEN';

CREATE UNIQUE INDEX "sale_single_in_progress_per_operator_key"
  ON "sale" ("operatorId") WHERE "status" = 'IN_PROGRESS';
