import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FinancialCategoryKind, type ManualEntryInput } from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import {
  categoriesOfKindQuery,
  useCreateManualEntry,
} from '@modules/financial/main/financial-queries';
import { CREATED_MESSAGE } from './constants';
import { ManualEntryFormLayout } from './layout';
import { manualEntryFormSchema, type TManualEntryFormInput } from './schema';
import type { TManualEntryFormFlowProps } from './types';

export function ManualEntryFormController({ onClose }: TManualEntryFormFlowProps) {
  const create = useCreateManualEntry();
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    TManualEntryFormInput,
    unknown,
    ManualEntryInput
  >({
    resolver: zodResolver(manualEntryFormSchema),
    mode: 'onChange',
    defaultValues: {
      kind: FinancialCategoryKind.EXPENSE,
      amount: '',
      description: '',
      categoryId: '',
    },
  });
  const kind = watch('kind');
  const { data: categories = [] } = useQuery(categoriesOfKindQuery(kind));

  // A categoria escolhida é do tipo anterior: trocar o tipo a limpa.
  const handleKindClick = (next: FinancialCategoryKind) => {
    setValue('kind', next, { shouldValidate: true });
    setValue('categoryId', '');
  };

  const handleSave = (input: ManualEntryInput) =>
    create.mutate(input, {
      onSuccess: () => {
        toast(CREATED_MESSAGE);
        onClose();
      },
    });

  return (
    <ManualEntryFormLayout
      kind={kind}
      categories={categories}
      register={register}
      canSubmit={formState.isValid && !create.isPending}
      onKindClick={handleKindClick}
      onSubmit={handleSubmit(handleSave)}
      onClose={onClose}
    />
  );
}
