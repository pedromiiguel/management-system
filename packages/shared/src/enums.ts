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

export const SaleStatus = {
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export const StockMovementType = {
  ENTRY: 'ENTRY',
  EXIT: 'EXIT',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export const StockMovementSource = {
  PURCHASE: 'PURCHASE',
  SALE: 'SALE',
  ADJUSTMENT: 'ADJUSTMENT',
  CANCELLATION: 'CANCELLATION',
} as const;
export type StockMovementSource = (typeof StockMovementSource)[keyof typeof StockMovementSource];

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

/** BR-03/FR-15: ao vender sem estoque, bloquear ou apenas avisar. */
export const StockPolicy = {
  BLOCK: 'BLOCK',
  WARN: 'WARN',
} as const;
export type StockPolicy = (typeof StockPolicy)[keyof typeof StockPolicy];

export const SettingKey = {
  STOCK_POLICY: 'STOCK_POLICY',
  REVENUE_TARGET_MONTHLY: 'REVENUE_TARGET_MONTHLY',
  ENABLED_PAYMENT_METHODS: 'ENABLED_PAYMENT_METHODS',
  DEFAULT_MINIMUM_STOCK: 'DEFAULT_MINIMUM_STOCK',
  EXPIRY_ALERT_DAYS: 'EXPIRY_ALERT_DAYS',
} as const;
export type SettingKey = (typeof SettingKey)[keyof typeof SettingKey];
