import type { IStockAlerts, IStockMovement } from '../../../domain/stock-model';

export type TStockModal = 'none' | 'entry' | 'adjustment';

export type TStockLayoutProps = {
  movements: IStockMovement[];
  alerts: IStockAlerts | undefined;
  modal: TStockModal;
  onEntryClick: () => void;
  onAdjustmentClick: () => void;
  onModalClose: () => void;
};
