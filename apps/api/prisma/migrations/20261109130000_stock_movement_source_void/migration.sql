-- Estornar (CONTEXT.md) grava a devolução ao estoque como VOID — o mesmo nome
-- do status da Venda estornada. CANCELLATION confundia com Cancelar (venda em
-- andamento abandonada), que nunca mexe no estoque.
ALTER TYPE "StockMovementSource" RENAME VALUE 'CANCELLATION' TO 'VOID';
