/**
 * Vocabulário do domínio. Cada enum aqui espelha um enum de
 * `apps/api/prisma/schema.prisma` — `apps/api/src/common/shared-enums.spec.ts`
 * falha se os dois divergirem.
 */

export const PaymentMethod = {
  CASH: 'CASH',
  PIX: 'PIX',
  CARD: 'CARD',
  CREDIT: 'CREDIT',
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  PIX: 'PIX',
  CARD: 'Cartão',
  CREDIT: 'Fiado (a prazo)',
};

/**
 * CANCELLED = venda em andamento abandonada (Cancelar — sem efeito em estoque
 * ou valores). VOIDED = venda concluída estornada (Estornar). Ver CONTEXT.md.
 */
export const SaleStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  VOIDED: 'VOIDED',
} as const;
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluída',
  CANCELLED: 'Cancelada',
  VOIDED: 'Estornada',
};

export const DiscountType = {
  AMOUNT: 'AMOUNT',
  PERCENT: 'PERCENT',
} as const;
export type DiscountType = (typeof DiscountType)[keyof typeof DiscountType];

export const StockMovementType = {
  ENTRY: 'ENTRY',
  EXIT: 'EXIT',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

/** Sentido do movimento: soma (entrada) ou subtrai (saída) do saldo. */
export const STOCK_MOVEMENT_TYPE_LABELS: Record<StockMovementType, string> = {
  ENTRY: 'Entrada',
  EXIT: 'Saída',
};

/**
 * Origem do movimento de estoque. PURCHASE = Entrada; ADJUSTMENT = Ajustar;
 * SALE = baixa na conclusão da Venda; VOID = devolução ao Estornar a Venda.
 */
export const StockMovementSource = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ADJUSTMENT: 'ADJUSTMENT',
  VOID: 'VOID',
} as const;
export type StockMovementSource = (typeof StockMovementSource)[keyof typeof StockMovementSource];

export const STOCK_MOVEMENT_SOURCE_LABELS: Record<StockMovementSource, string> = {
  PURCHASE: 'Compra/reposição',
  SALE: 'Venda (PDV)',
  ADJUSTMENT: 'Ajuste manual',
  VOID: 'Estorno de venda',
};

export const CashRegisterStatus = {
  OPEN: 'OPEN',
  CLOSED: 'CLOSED',
} as const;
export type CashRegisterStatus = (typeof CashRegisterStatus)[keyof typeof CashRegisterStatus];

export const CashMovementType = {
  INFLOW: 'INFLOW',
  OUTFLOW: 'OUTFLOW',
  PULL: 'PULL',
  FLOAT: 'FLOAT',
} as const;
export type CashMovementType = (typeof CashMovementType)[keyof typeof CashMovementType];

export const CASH_MOVEMENT_LABELS: Record<CashMovementType, string> = {
  INFLOW: 'Entrada',
  OUTFLOW: 'Saída',
  PULL: 'Sangria',
  FLOAT: 'Suprimento',
};

export const ReceivableStatus = {
  OPEN: 'OPEN',
  RECEIVED: 'RECEIVED',
} as const;
export type ReceivableStatus = (typeof ReceivableStatus)[keyof typeof ReceivableStatus];

export const PayableStatus = {
  OPEN: 'OPEN',
  PAID: 'PAID',
} as const;
export type PayableStatus = (typeof PayableStatus)[keyof typeof PayableStatus];

export const FinancialCategoryKind = {
  INCOME: 'INCOME',
  EXPENSE: 'EXPENSE',
} as const;
export type FinancialCategoryKind =
  (typeof FinancialCategoryKind)[keyof typeof FinancialCategoryKind];

/**
 * Categorias financeiras que o próprio sistema lança. Identificadas por este
 * código estável (coluna `code`), não pelo nome de exibição — renomear a
 * categoria na tela não corta o vínculo.
 */
export const SystemCategory = {
  SALES: 'SALES',
  RECEIVABLE_SETTLEMENT: 'RECEIVABLE_SETTLEMENT',
} as const;
export type SystemCategory = (typeof SystemCategory)[keyof typeof SystemCategory];

/** BR-03/FR-15: ao vender sem estoque, bloquear ou apenas avisar. */
export const StockPolicy = {
  BLOCK: 'BLOCK',
  WARN: 'WARN',
} as const;
export type StockPolicy = (typeof StockPolicy)[keyof typeof StockPolicy];
