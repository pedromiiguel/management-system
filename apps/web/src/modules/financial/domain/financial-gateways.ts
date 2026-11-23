import type {
  ICashFlow,
  ICashRegister,
  IDashboard,
  IFinancialCategory,
  IPayable,
  IPeriod,
  IReceivable,
  TCashMovementParams,
  TCloseRegisterParams,
  TCreateCategoryParams,
  TCreatePayableParams,
  TManualEntryParams,
  TOpenRegisterParams,
  TSettleReceivableParams,
} from './financial-model';

/** Um gateway por recurso da API do financeiro: cada um muda com o seu endpoint. */
export interface IFinancialGateway {
  getDashboard: () => Promise<IDashboard>;
  getCashFlow: (period: IPeriod) => Promise<ICashFlow>;
  listCategories: () => Promise<IFinancialCategory[]>;
  createCategory: (params: TCreateCategoryParams) => Promise<void>;
  /** Lançamento avulso (FR-35), fora do PDV e do caixa. */
  createManualEntry: (params: TManualEntryParams) => Promise<void>;
}

export interface ICashRegisterGateway {
  getCurrent: () => Promise<ICashRegister | null>;
  getHistory: () => Promise<ICashRegister[]>;
  open: (params: TOpenRegisterParams) => Promise<void>;
  /** Sangria, suprimento ou saída do caixa. */
  createMovement: (params: TCashMovementParams) => Promise<void>;
  close: (params: TCloseRegisterParams) => Promise<ICashRegister>;
}

export interface IReceivablesGateway {
  /** Só os fiados em aberto. */
  listOpen: () => Promise<IReceivable[]>;
  /** Receber fiado: entra no caixa/fluxo e baixa a dívida do cliente (BR-08). */
  settle: (params: TSettleReceivableParams) => Promise<void>;
}

export interface IPayablesGateway {
  /** Só as contas em aberto. */
  listOpen: () => Promise<IPayable[]>;
  create: (params: TCreatePayableParams) => Promise<void>;
  /** Pagar conta: lança a saída no fluxo de caixa. */
  pay: (id: string) => Promise<void>;
}
