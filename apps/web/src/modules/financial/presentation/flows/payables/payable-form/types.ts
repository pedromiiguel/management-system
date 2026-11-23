import type { UseFormRegister } from 'react-hook-form';
import type { IFinancialCategory } from '../../../../domain/financial-model';
import type { TPayableFormInput } from './schema';

export type TPayableFormFlowProps = { onClose: () => void };

export type TPayableFormLayoutProps = {
  categories: IFinancialCategory[];
  register: UseFormRegister<TPayableFormInput>;
  canSubmit: boolean;
  onSubmit: () => void;
  onClose: () => void;
};
