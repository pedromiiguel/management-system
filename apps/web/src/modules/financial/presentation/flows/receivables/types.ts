import type { SettleReceivableInput } from '@beverage/shared';
import type { IReceivable } from '../../../domain/financial-model';

export type TSettleMethod = SettleReceivableInput['paymentMethod'];

export type TReceivablesLayoutProps = {
  receivables: IReceivable[];
  totalOpen: number;
  settling: IReceivable | null;
  onReceiveClick: (receivable: IReceivable) => void;
  onSettleMethodClick: (receivable: IReceivable, method: TSettleMethod) => void;
  onSettleClose: () => void;
};
