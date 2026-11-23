import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FinancialCategoryKind, type PayableInput } from '@beverage/shared';
import { todayKey } from '@presentation/utils/format';
import { toast } from '@presentation/utils/toast';
import { categoriesOfKindQuery, useCreatePayable } from '@modules/financial/main/financial-queries';
import { CREATED_MESSAGE } from './constants';
import { PayableFormLayout } from './layout';
import { payableFormSchema, type TPayableFormInput } from './schema';
import type { TPayableFormFlowProps } from './types';

export function PayableFormController({ onClose }: TPayableFormFlowProps) {
  const { data: categories = [] } = useQuery(categoriesOfKindQuery(FinancialCategoryKind.EXPENSE));
  const create = useCreatePayable();
  const { register, handleSubmit, formState } = useForm<TPayableFormInput, unknown, PayableInput>({
    resolver: zodResolver(payableFormSchema),
    mode: 'onChange',
    defaultValues: {
      description: '',
      supplier: '',
      amount: '',
      dueDate: todayKey(),
      categoryId: '',
    },
  });

  const handleSave = (input: PayableInput) =>
    create.mutate(input, {
      onSuccess: () => {
        toast(CREATED_MESSAGE);
        onClose();
      },
    });

  return (
    <PayableFormLayout
      categories={categories}
      register={register}
      canSubmit={formState.isValid && !create.isPending}
      onSubmit={handleSubmit(handleSave)}
      onClose={onClose}
    />
  );
}
