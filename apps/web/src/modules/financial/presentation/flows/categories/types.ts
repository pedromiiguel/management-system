import type { UseFormRegister } from 'react-hook-form';
import type { FinancialCategoryInput, FinancialCategoryKind } from '@beverage/shared';
import type { IFinancialCategory } from '../../../domain/financial-model';

export type TCategoriesLayoutProps = {
  categories: IFinancialCategory[];
  register: UseFormRegister<FinancialCategoryInput>;
  kind: FinancialCategoryKind;
  canSubmit: boolean;
  onKindClick: (kind: FinancialCategoryKind) => void;
  onSubmit: () => void;
};
