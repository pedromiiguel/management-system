import type {
  CashMovementType,
  CashRegisterStatus,
  PaymentMethod,
  SaleStatus,
} from '@beverage/shared';

export interface Product {
  id: string;
  sku: string;
  ean: string | null;
  name: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  active: boolean;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}

export interface SaleItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  product: { name: string; sku: string; ean: string | null; unit: string };
}

export interface Sale {
  id: string;
  status: SaleStatus;
  subtotal: number;
  total: number;
  discountType: 'AMOUNT' | 'PERCENT' | null;
  discountValue: number | null;
  paymentMethod: PaymentMethod | null;
  amountPaid: number | null;
  change: number | null;
  withInvoice: boolean;
  openedAt: string;
  completedAt: string | null;
  cancelledAt: string | null;
  items: SaleItem[];
  customer: { id: string; name: string } | null;
  operator: { id: string; name: string };
}

export interface Customer {
  id: string;
  name: string;
  contact: string | null;
  active: boolean;
  openBalance: number;
}

export interface CashMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod | null;
  occurredAt: string;
  category?: { id: string; name: string } | null;
  sale?: { id: string } | null;
}

export interface CashRegister {
  id: string;
  status: CashRegisterStatus;
  openingBalance: number;
  expectedBalance: number | null;
  countedBalance: number | null;
  difference: number | null;
  openedAt: string;
  closedAt: string | null;
  note: string | null;
  operator: { id: string; name: string };
  movements?: CashMovement[];
  summary?: {
    inflowsByMethod: Record<string, number>;
    pulls: number;
    floats: number;
    outflows: number;
    expectedCash: number;
  };
}

export interface Receivable {
  id: string;
  amount: number;
  dueDate: string | null;
  status: 'OPEN' | 'RECEIVED';
  receivedAt: string | null;
  createdAt: string;
  customer: { id: string; name: string; contact: string | null };
  sale: { id: string; completedAt: string | null; total: number } | null;
}

export interface Payable {
  id: string;
  description: string;
  supplier: string | null;
  amount: number;
  dueDate: string;
  status: 'OPEN' | 'PAID';
  paidAt: string | null;
  category: { id: string; name: string } | null;
}

export interface FinancialCategory {
  id: string;
  name: string;
  kind: 'INCOME' | 'EXPENSE';
  system: boolean;
}

export interface Dashboard {
  revenue: { day: number; month: number; year: number };
  byMethodMonth: { paymentMethod: PaymentMethod; total: number; count: number }[];
  result: { revenue: number; cogs: number; expenses: number; profit: number };
  target: { monthly: number | null; progress: number | null };
}

export interface StockAlerts {
  lowStock: { id: string; name: string; sku: string; currentStock: number; minimumStock: number }[];
  expiring: {
    id: string;
    batch: string | null;
    expiresAt: string | null;
    quantity: number;
    product: { id: string; name: string; sku: string };
  }[];
}

export interface AppSettings {
  stockPolicy: 'BLOCK' | 'WARN';
  revenueTargetMonthly: number | null;
  enabledPaymentMethods: PaymentMethod[];
  defaultMinimumStock: number;
  expiryAlertDays: number;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  system: boolean;
}

export interface UserRow {
  id: string;
  name: string;
  login: string;
  active: boolean;
  roleId: string;
  role: { id: string; name: string };
}
