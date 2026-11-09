import { z } from 'zod';
import {
  CashMovementType,
  DiscountType,
  FinancialCategoryKind,
  PayableStatus,
  PaymentMethod,
  ReceivableStatus,
  SaleStatus,
  StockPolicy,
} from './enums';
import { Permission } from './permissions';
import { endOfStoreDay, startOfStoreDay } from './time';

/*
 * Convenção: schemas "base" não têm `.default()`. Defaults existem só nos
 * schemas de criação; schemas de atualização são `base.partial()` — assim um
 * PATCH parcial nunca reescreve campos que não enviou.
 */

/** Valor monetário em reais com até 2 casas (nunca float arbitrário). */
export const money = z
  .number()
  .min(0)
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, {
    message: 'Valor monetário deve ter no máximo 2 casas decimais',
  });

const positiveMoney = money.refine((v) => v > 0, 'Valor deve ser maior que zero');

export const quantity = z.number().int().positive();

// ---------- Auth ----------
export const loginSchema = z.object({
  login: z.string().min(1, 'Informe o login'),
  password: z.string().min(1, 'Informe a senha'),
});
export type LoginInput = z.infer<typeof loginSchema>;

// ---------- Usuários / papéis ----------
const userFields = z.object({
  name: z.string().min(1, 'Informe o nome'),
  login: z.string().min(3, 'Login deve ter ao menos 3 caracteres'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  roleId: z.string().min(1, 'Selecione o papel'),
  active: z.boolean(),
});

export const createUserSchema = userFields.extend({ active: z.boolean().default(true) });
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = userFields.partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const roleSchema = z.object({
  name: z.string().min(1, 'Informe o nome do papel'),
  permissions: z.array(z.enum(Permission)).min(1, 'Selecione ao menos uma permissão'),
});
export type RoleInput = z.infer<typeof roleSchema>;

export const updateRoleSchema = roleSchema.partial();
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

// ---------- Estoque (FR-05/FR-08) ----------
/** Campos de uma Entrada (CONTEXT.md) — sempre aditiva. */
const stockEntryFields = z.object({
  quantity,
  unitCost: money.optional(),
  batch: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
  note: z.string().optional(),
});

export const stockEntrySchema = stockEntryFields.extend({ productId: z.string().min(1) });
export type StockEntryInput = z.infer<typeof stockEntrySchema>;

export const stockAdjustmentSchema = z.object({
  productId: z.string().min(1),
  /** Positivo aumenta, negativo reduz. */
  quantity: z
    .number()
    .int()
    .refine((v) => v !== 0, 'Quantidade não pode ser zero'),
  reason: z.string().min(3, 'Informe o motivo do ajuste'),
});
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

// ---------- Produtos (FR-01) ----------
/**
 * Entrada embutida no formulário de Produto: o custo é o preço de compra do
 * próprio produto, por isso não tem `unitCost`.
 */
export const productStockEntrySchema = stockEntryFields.pick({
  quantity: true,
  batch: true,
  expiresAt: true,
});
export type ProductStockEntryInput = z.infer<typeof productStockEntrySchema>;

const productFields = z.object({
  name: z.string().min(1, 'Informe o nome'),
  sku: z.string().min(1, 'Informe o SKU'),
  /** Vazio = sem EAN. */
  ean: z
    .string()
    .regex(/^\d{8,14}$/, 'EAN deve ter de 8 a 14 dígitos')
    .optional()
    .or(z.literal('')),
  unit: z.string().min(1, 'Informe a unidade (ex.: un, cx, L)'),
  purchasePrice: money,
  salePrice: money,
  minimumStock: z.number().int().min(0),
  active: z.boolean(),
  /** Se presente, lança uma Entrada (soma ao saldo) na mesma transação. */
  stockEntry: productStockEntrySchema.optional(),
});

export const productSchema = productFields.extend({
  minimumStock: productFields.shape.minimumStock.default(0),
  active: productFields.shape.active.default(true),
});
export type ProductInput = z.infer<typeof productSchema>;

export const updateProductSchema = productFields.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

// ---------- Clientes (FR-25) ----------
export const customerSchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  contact: z.string().optional(),
});
export type CustomerInput = z.infer<typeof customerSchema>;

// ---------- Vendas / PDV ----------
export const addSaleItemSchema = z.object({
  /** EAN, SKU ou id do produto — o backend resolve (FR-10/FR-11). */
  code: z.string().min(1),
  quantity: quantity.default(1),
});
export type AddSaleItemInput = z.infer<typeof addSaleItemSchema>;

export const updateSaleItemSchema = z.object({
  quantity,
});
export type UpdateSaleItemInput = z.infer<typeof updateSaleItemSchema>;

export const discountSchema = z
  .object({
    type: z.enum(DiscountType),
    value: money,
  })
  .refine((d) => d.type !== DiscountType.PERCENT || d.value <= 100, {
    message: 'Percentual máximo é 100%',
  });
export type DiscountInput = z.infer<typeof discountSchema>;

/** Liga/desliga a Taxa de serviço da Venda em andamento — o total já passa a incluí-la. */
export const serviceFeeSchema = z.object({
  enabled: z.boolean(),
});
export type ServiceFeeInput = z.infer<typeof serviceFeeSchema>;

const completeSaleFields = z.object({
  paymentMethod: z.enum(PaymentMethod),
  /** Obrigatório para pagamento em dinheiro (FR-18). */
  amountPaid: money.optional(),
  withInvoice: z.boolean().default(false),
  /** Se enviado, liga/desliga a Taxa de serviço antes de concluir; omitido mantém a da Venda. */
  serviceFee: z.boolean().optional(),
  /** Obrigatório para venda a prazo (BR-08). */
  customerId: z.string().optional(),
  dueDate: z.coerce.date().optional(),
});
type CompleteSaleFields = z.output<typeof completeSaleFields>;

/** Dinheiro sempre traz o valor recebido; venda a prazo sempre traz o cliente. */
export const completeSaleSchema = completeSaleFields
  .refine(
    (
      s,
    ): s is CompleteSaleFields &
      (
        | { paymentMethod: Exclude<PaymentMethod, 'CASH'> }
        | { paymentMethod: 'CASH'; amountPaid: number }
      ) => s.paymentMethod !== PaymentMethod.CASH || s.amountPaid !== undefined,
    { message: 'Informe o valor recebido em dinheiro', path: ['amountPaid'] },
  )
  .refine(
    (
      s,
    ): s is typeof s &
      (
        | { paymentMethod: Exclude<PaymentMethod, 'CREDIT'> }
        | { paymentMethod: 'CREDIT'; customerId: string }
      ) => s.paymentMethod !== PaymentMethod.CREDIT || !!s.customerId,
    { message: 'Venda a prazo exige cliente', path: ['customerId'] },
  );
/** Corpo enviado pelo PDV (antes dos defaults). */
export type CompleteSaleBody = z.input<typeof completeSaleSchema>;
export type CompleteSaleInput = z.output<typeof completeSaleSchema>;

// ---------- Caixa (FR-27) ----------
export const openRegisterSchema = z.object({
  openingBalance: money,
});
export type OpenRegisterInput = z.infer<typeof openRegisterSchema>;

export const closeRegisterSchema = z.object({
  /** Saldo contado pelo operador — conferido contra o calculado (BR-06). */
  countedBalance: money,
  note: z.string().optional(),
});
export type CloseRegisterInput = z.infer<typeof closeRegisterSchema>;

export const cashMovementSchema = z.object({
  type: z.enum(CashMovementType),
  amount: positiveMoney,
  description: z.string().min(1, 'Informe a descrição'),
  categoryId: z.string().optional(),
});
export type CashMovementInput = z.infer<typeof cashMovementSchema>;

// ---------- Financeiro ----------
export const financialCategorySchema = z.object({
  name: z.string().min(1, 'Informe o nome'),
  kind: z.enum(FinancialCategoryKind),
});
export type FinancialCategoryInput = z.infer<typeof financialCategorySchema>;

export const payableSchema = z.object({
  description: z.string().min(1, 'Informe a descrição'),
  supplier: z.string().optional(),
  amount: positiveMoney,
  dueDate: z.coerce.date(),
  categoryId: z.string().optional(),
});
export type PayableInput = z.infer<typeof payableSchema>;

export const manualEntrySchema = z.object({
  kind: z.enum(FinancialCategoryKind),
  amount: positiveMoney,
  description: z.string().min(1, 'Informe a descrição'),
  categoryId: z.string().optional(),
  date: z.coerce.date().optional(),
});
export type ManualEntryInput = z.infer<typeof manualEntrySchema>;

export const settleReceivableSchema = z.object({
  /** Como o fiado foi recebido — vira entrada no fluxo de caixa (BR-08). Fiado não quita fiado. */
  paymentMethod: z.enum(PaymentMethod).exclude([PaymentMethod.CREDIT]),
});
export type SettleReceivableInput = z.infer<typeof settleReceivableSchema>;

// ---------- Configurações (NFR-10) ----------
const settingsFields = z.object({
  stockPolicy: z.enum(StockPolicy),
  revenueTargetMonthly: positiveMoney.nullable(),
  enabledPaymentMethods: z.array(z.enum(PaymentMethod)).min(1),
  expiryAlertDays: z.number().int().min(1),
});
export type AppSettings = z.infer<typeof settingsFields>;
export type SettingKey = keyof AppSettings;
export const SETTING_KEYS = Object.keys(settingsFields.shape) as SettingKey[];

export const DEFAULT_SETTINGS: AppSettings = {
  stockPolicy: StockPolicy.BLOCK,
  revenueTargetMonthly: null,
  enabledPaymentMethods: Object.values(PaymentMethod),
  expiryAlertDays: 30,
};

/** Configurações completas: campos ausentes recebem o default. */
export const settingsSchema = settingsFields
  .partial()
  .transform((v): AppSettings => ({ ...DEFAULT_SETTINGS, ...definedOnly(v) }));

/** Corpo do PUT /settings: só os campos alterados. */
export const updateSettingsSchema = settingsFields.partial();
export type SettingsInput = z.infer<typeof updateSettingsSchema>;

/** Valida um único valor de configuração (ex.: lido do banco). */
export function parseSetting<K extends SettingKey>(key: K, value: unknown) {
  return settingsFields.shape[key].safeParse(value) as z.ZodSafeParseResult<AppSettings[K]>;
}

function definedOnly<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

// ---------- Consultas (query string) ----------
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Data de filtro. `AAAA-MM-DD` é um dia civil da loja (início do dia em
 * `from`, fim do dia em `to`); qualquer outro formato é um instante (ISO).
 */
const periodBound = (edge: 'start' | 'end') =>
  z
    .string()
    .min(1)
    .transform((value, ctx) => {
      if (DATE_ONLY.test(value)) {
        return edge === 'start' ? startOfStoreDay(value) : endOfStoreDay(value);
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) {
        ctx.addIssue({ code: 'custom', message: 'Data inválida' });
        return z.NEVER;
      }
      return date;
    });

export const periodQuerySchema = z.object({
  from: periodBound('start'),
  to: periodBound('end'),
});
export type PeriodQuery = z.output<typeof periodQuerySchema>;

const optionalPeriodQuerySchema = z.object({
  from: periodBound('start').optional(),
  to: periodBound('end').optional(),
});

const pageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export const reportQuerySchema = periodQuerySchema.extend({
  format: z.enum(['json', 'csv']).default('json'),
});
export type ReportQuery = z.output<typeof reportQuerySchema>;

export const productListQuerySchema = pageQuerySchema.extend({
  search: z.string().optional(),
  /** `all=true` inclui produtos desativados. */
  all: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
  perPage: z.coerce.number().int().min(1).max(200).default(50),
});
export type ProductListQuery = z.output<typeof productListQuerySchema>;

export const saleHistoryQuerySchema = optionalPeriodQuerySchema
  .extend(pageQuerySchema.shape)
  .extend({
    status: z.enum(SaleStatus).exclude([SaleStatus.IN_PROGRESS]).optional(),
  });
export type SaleHistoryQuery = z.output<typeof saleHistoryQuerySchema>;

export const receivableListQuerySchema = z.object({
  customerId: z.string().optional(),
  status: z.enum(ReceivableStatus).default(ReceivableStatus.OPEN),
});
export type ReceivableListQuery = z.output<typeof receivableListQuerySchema>;

export const payableListQuerySchema = z.object({
  status: z.enum(PayableStatus).default(PayableStatus.OPEN),
});
export type PayableListQuery = z.output<typeof payableListQuerySchema>;

export const stockMovementQuerySchema = z.object({
  productId: z.string().optional(),
});
export type StockMovementQuery = z.output<typeof stockMovementQuerySchema>;

export const customerListQuerySchema = z.object({
  search: z.string().optional(),
});
export type CustomerListQuery = z.output<typeof customerListQuerySchema>;
