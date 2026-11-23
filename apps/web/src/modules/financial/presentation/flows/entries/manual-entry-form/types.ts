import type { UseFormRegister } from 'react-hook-form';
import type { FinancialCategoryKind } from '@beverage/shared';
import type { IFinancialCategory } from '../../../../domain/financial-model';
import type { TManualEntryFormInput } from './schema';

export type TManualEntryFormFlowProps = { onClose: () => void };

export type TManualEntryFormLayoutProps = {
  kind: FinancialCategoryKind;
  categories: IFinancialCategory[];
  register: UseFormRegister<TManualEntryFormInput>;
  canSubmit: boolean;
  onKindClick: (kind: FinancialCategoryKind) => void;
  onSubmit: () => void;
  onClose: () => void;
};
