import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  FinancialCategoryKind,
  financialCategorySchema,
  type FinancialCategoryInput,
} from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import { categoriesQuery, useCreateCategory } from '@modules/financial/main/financial-queries';
import { CREATED_MESSAGE } from './constants';
import { CategoriesLayout } from './layout';

/** Categorias de receitas e despesas (aba de Configurações). */
export function CategoriesController() {
  const { data: categories = [] } = useQuery(categoriesQuery());
  const create = useCreateCategory();
  const { register, handleSubmit, watch, setValue, formState } = useForm<FinancialCategoryInput>({
    resolver: zodResolver(financialCategorySchema),
    mode: 'onChange',
    defaultValues: { name: '', kind: FinancialCategoryKind.EXPENSE },
  });

  const handleSave = (input: FinancialCategoryInput) =>
    create.mutate(input, {
      onSuccess: () => {
        // `reset` não serve aqui: o layout memoizado não registra o campo de novo.
        setValue('name', '', { shouldValidate: true });
        toast(CREATED_MESSAGE);
      },
    });

  return (
    <CategoriesLayout
      categories={categories}
      register={register}
      kind={watch('kind')}
      canSubmit={formState.isValid && !create.isPending}
      onKindClick={(kind) => setValue('kind', kind)}
      onSubmit={handleSubmit(handleSave)}
    />
  );
}
