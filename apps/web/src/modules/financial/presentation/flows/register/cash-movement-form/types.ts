import type { UseFormRegister } from 'react-hook-form';
import type { CashMovementType } from '@beverage/shared';
import type { TCashMovementFormInput } from './schema';

export type TCashMovementFormFlowProps = { onClose: () => void };

export type TCashMovementFormLayoutProps = {
  type: CashMovementType;
  register: UseFormRegister<TCashMovementFormInput>;
  descriptionPlaceholder: string;
  canSubmit: boolean;
  onTypeClick: (type: CashMovementType) => void;
  onSubmit: () => void;
  onClose: () => void;
};
