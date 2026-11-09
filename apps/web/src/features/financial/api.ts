import { queryOptions, useMutation } from '@tanstack/react-query';
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
import { http } from '@/lib/http';
import { endOfDay } from '@/lib/format';
import { rootKeys, useInvalidate } from '@/lib/query-keys';
import type { Customer, Sale } from '@/features/sale/api';

export interface FinancialCategory {
  id: string;
  name: string;
  kind: FinancialCategoryKind;
  system: boolean;
}

export interface CashMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod | null;
  occurredAt: string;
  category?: Pick<FinancialCategory, 'id' | 'name'> | null;
  sale?: Pick<Sale, 'id'> | null;
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
    inflowsByMethod: Partial<Record<PaymentMethod, number>>;
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
  status: ReceivableStatus;
  receivedAt: string | null;
  createdAt: string;
  customer: Pick<Customer, 'id' | 'name' | 'contact'>;
  sale: Pick<Sale, 'id' | 'completedAt' | 'total'> | null;
}

export interface Payable {
  id: string;
  description: string;
  supplier: string | null;
  amount: number;
  dueDate: string;
  status: PayableStatus;
  paidAt: string | null;
  category: Pick<FinancialCategory, 'id' | 'name'> | null;
}

interface DayMonthYear {
  day: number;
  month: number;
  year: number;
}

export interface Dashboard {
  /** Receita (CONTEXT.md): produtos, sem a Taxa de serviço. */
  revenue: DayMonthYear;
  serviceFee: DayMonthYear;
  /** Valor cobrado (com Taxa de serviço) por forma de pagamento no mês. */
  byMethodMonth: { paymentMethod: PaymentMethod; total: number; count: number }[];
  /** Últimos meses da loja (`AAAA-MM`), o atual por último. */
  monthly: { month: string; revenue: number; serviceFee: number }[];
  result: { revenue: number; serviceFee: number; cogs: number; expenses: number; profit: number };
  target: { monthly: number | null; progress: number | null };
}

export interface CashFlow {
  movements: CashMovement[];
  inflows: number;
  outflows: number;
  balance: number;
}

export const dashboardQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.financial, 'dashboard'],
    queryFn: () => http.get<Dashboard>('/financial/dashboard'),
  });

export const cashFlowQuery = (from: string, to: string) =>
  queryOptions({
    queryKey: [...rootKeys.financial, 'cash-flow', from, to],
    queryFn: () => http.get<CashFlow>('/financial/cash-flow', { from, to: endOfDay(to) }),
  });

export const categoriesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.financial, 'categories'],
    queryFn: () => http.get<FinancialCategory[]>('/financial/categories'),
  });

export const currentRegisterQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.cashRegister, 'current'],
    queryFn: () => http.get<CashRegister | null>('/cash-register/current'),
  });

export const registerHistoryQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.cashRegister, 'history'],
    queryFn: () => http.get<CashRegister[]>('/cash-register/history'),
  });

/** A API devolve só os fiados em aberto. */
export const receivablesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.receivables],
    queryFn: () => http.get<Receivable[]>('/receivables'),
  });

/** A API devolve só as contas em aberto. */
export const payablesQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.payables],
    queryFn: () => http.get<Payable[]>('/payables'),
  });

export function useOpenRegister() {
  const onSuccess = useInvalidate('cashRegister', 'financial');
  return useMutation({
    mutationFn: (input: OpenRegisterInput) => http.post<CashRegister>('/cash-register/open', input),
    onSuccess,
  });
}

/** Sangria, suprimento ou saída do caixa. */
export function useCreateCashMovement() {
  const onSuccess = useInvalidate('cashRegister', 'financial');
  return useMutation({
    mutationFn: (input: CashMovementInput) =>
      http.post<CashMovement>('/cash-register/movements', input),
    onSuccess,
  });
}

export function useCloseRegister() {
  const onSuccess = useInvalidate('cashRegister', 'financial');
  return useMutation({
    mutationFn: (input: CloseRegisterInput) =>
      http.post<CashRegister>('/cash-register/close', input),
    onSuccess,
  });
}

/** Receber fiado: entra no caixa/fluxo e baixa a dívida do cliente (BR-08). */
export function useSettleReceivable() {
  const onSuccess = useInvalidate('receivables', 'cashRegister', 'financial', 'customers');
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SettleReceivableInput }) =>
      http.post<Receivable>(`/receivables/${id}/settle`, input),
    onSuccess,
  });
}

export function useCreatePayable() {
  const onSuccess = useInvalidate('payables');
  return useMutation({
    mutationFn: (input: PayableInput) => http.post<Payable>('/payables', input),
    onSuccess,
  });
}

/** Pagar conta: lança a saída no fluxo de caixa. */
export function usePayPayable() {
  const onSuccess = useInvalidate('payables', 'cashRegister', 'financial');
  return useMutation({
    mutationFn: (id: string) => http.post<Payable>(`/payables/${id}/pay`),
    onSuccess,
  });
}

/** Lançamento avulso (FR-35), fora do PDV e do caixa. */
export function useCreateManualEntry() {
  const onSuccess = useInvalidate('financial');
  return useMutation({
    mutationFn: (input: ManualEntryInput) => http.post<CashMovement>('/financial/entries', input),
    onSuccess,
  });
}

export function useCreateCategory() {
  const onSuccess = useInvalidate('financial');
  return useMutation({
    mutationFn: (input: FinancialCategoryInput) =>
      http.post<FinancialCategory>('/financial/categories', input),
    onSuccess,
  });
}
