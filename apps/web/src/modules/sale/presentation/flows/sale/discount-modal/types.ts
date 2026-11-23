import type { FormEvent } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { DiscountInput, DiscountType } from '@beverage/shared';
import type { TDiscountFormValues } from './schema';

export type TDiscountModalProps = {
  onApply: (discount: DiscountInput | null) => void;
  onClose: () => void;
};

export type TDiscountModalLayoutProps = {
  type: DiscountType;
  register: UseFormRegister<TDiscountFormValues>;
  canApply: boolean;
  onTypeChange: (type: DiscountType) => void;
  onSubmit: (event?: FormEvent) => void;
  onRemove: () => void;
  onClose: () => void;
};
