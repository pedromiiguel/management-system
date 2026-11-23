import type {
  CashMovementInput,
  CashMovementType,
  CashRegisterStatus,
  CloseRegisterInput,
  FinancialCategoryInput,
  FinancialCategoryKind,
  ManualEntryInput,
  OpenRegisterInput,
  PayableInput,
  PayableStatus,
  PaymentMethod,
  ReceivableStatus,
  SettleReceivableInput,
} from '@beverage/shared';

export interface IFinancialCategory {
  id: string;
  name: string;
  kind: FinancialCategoryKind;
  /** Categoria de sistema (Vendas, Recebimento de fiado…), identificada por código na API. */
  system: boolean;
}

export interface ICashMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod | null;
  occurredAt: string;
  category?: Pick<IFinancialCategory, 'id' | 'name'> | null;
  sale?: { id: string } | null;
}

export interface ICashRegisterSummary {
  inflowsByMethod: Partial<Record<PaymentMethod, number>>;
  pulls: number;
  floats: number;
  outflows: number;
  expectedCash: number;
}

export interface ICashRegister {
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
  movements?: ICashMovement[];
  summary?: ICashRegisterSummary;
}

export interface IReceivable {
  id: string;
  amount: number;
  dueDate: string | null;
  status: ReceivableStatus;
  receivedAt: string | null;
  createdAt: string;
  customer: { id: string; name: string; contact: string | null };
  sale: { id: string; completedAt: string | null; total: number } | null;
}

export interface IPayable {
  id: string;
  description: string;
  supplier: string | null;
  amount: number;
  dueDate: string;
  status: PayableStatus;
  paidAt: string | null;
  category: Pick<IFinancialCategory, 'id' | 'name'> | null;
}

interface IDayMonthYear {
  day: number;
  month: number;
  year: number;
}

export interface IDashboard {
  /** Receita (CONTEXT.md): produtos, sem a Taxa de serviço. */
  revenue: IDayMonthYear;
  serviceFee: IDayMonthYear;
  /** Valor cobrado (com Taxa de serviço) por forma de pagamento no mês. */
  byMethodMonth: { paymentMethod: PaymentMethod; total: number; count: number }[];
  /** Últimos meses da loja (`AAAA-MM`), o atual por último. */
  monthly: { month: string; revenue: number; serviceFee: number }[];
  result: { revenue: number; serviceFee: number; cogs: number; expenses: number; profit: number };
  target: { monthly: number | null; progress: number | null };
}

export interface ICashFlow {
  movements: ICashMovement[];
  inflows: number;
  outflows: number;
  balance: number;
}

export interface IPeriod {
  from: string;
  to: string;
}

export type TCreateCategoryParams = FinancialCategoryInput;
export type TManualEntryParams = ManualEntryInput;
export type TOpenRegisterParams = OpenRegisterInput;
export type TCashMovementParams = CashMovementInput;
export type TCloseRegisterParams = CloseRegisterInput;
export type TSettleReceivableParams = { id: string; input: SettleReceivableInput };
export type TCreatePayableParams = PayableInput;
