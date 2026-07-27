import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/presentation/components/Toast';
import { apiErrorMessage } from '@/lib/api';
import { useCreateFinancialCategoryMutation } from '@/main/factories/mutations/financial';
import { useFinancialCategoriesQuery } from '@/main/factories/queries/financial';
import type { CategoryKind } from './CategoriesTab.types';

export function useCategoriesTabModel() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [kind, setKind] = useState<CategoryKind>('EXPENSE');

  const { data: categories = [] } = useFinancialCategoriesQuery();

  const create = useCreateFinancialCategoryMutation();

  const submit = () => {
    create.mutate(
      { name, kind },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ['financial', 'categories'] });
          setName('');
          toast('Categoria criada');
        },
        onError: (error) => toast(apiErrorMessage(error), 'danger'),
      },
    );
  };

  return { name, setName, kind, setKind, categories, saving: create.isPending, submit };
}
