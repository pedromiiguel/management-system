import type {
  IStockAlerts,
  IStockMovement,
  TStockAdjustmentParams,
  TStockEntryParams,
} from './stock-model';

export interface IStockGateway {
  getAlerts: () => Promise<IStockAlerts>;
  getMovements: () => Promise<IStockMovement[]>;
  /** Entrada: soma ao saldo, nunca sobrescreve. */
  registerEntry: (params: TStockEntryParams) => Promise<void>;
  /** Ajustar: correção auditada do saldo, com motivo obrigatório. */
  registerAdjustment: (params: TStockAdjustmentParams) => Promise<void>;
}
