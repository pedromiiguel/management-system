import type { IPayable } from '../../../domain/financial-model';

export type TPayableRow = { payable: IPayable; isOverdue: boolean };

export type TPayablesLayoutProps = {
  rows: TPayableRow[];
  isCreating: boolean;
  onNewClick: () => void;
  onPayClick: (payable: IPayable) => void;
  onFormClose: () => void;
};
