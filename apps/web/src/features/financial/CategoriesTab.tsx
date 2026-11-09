import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  FinancialCategoryKind,
  financialCategorySchema,
  type FinancialCategoryInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/components/Toast';
import { categoriesQuery, useCreateCategory } from './api';

/** Categorias de receitas e despesas (aba de Configurações). */
export function CategoriesTab() {
  const { data: categories = [] } = useQuery(categoriesQuery());
  const create = useCreateCategory();
  const { register, handleSubmit, watch, setValue, reset, formState } =
    useForm<FinancialCategoryInput>({
      resolver: zodResolver(financialCategorySchema),
      mode: 'onChange',
      defaultValues: { name: '', kind: FinancialCategoryKind.EXPENSE },
    });
  const kind = watch('kind');

  const submit = handleSubmit((input) =>
    create.mutate(input, {
      onSuccess: () => {
        reset({ name: '', kind: input.kind });
        toast('Categoria criada');
      },
    }),
  );

  return (
    <Card className="max-w-[560px]">
      <div className="s-card-title">Categorias de receitas e despesas</div>
      <form className="flex gap-2 mb-3" onSubmit={submit}>
        <div className="s-input flex-1">
          <input data-testid="category-name" placeholder="Nova categoria…" {...register('name')} />
        </div>
        <Chip
          active={kind === FinancialCategoryKind.EXPENSE}
          onClick={() => setValue('kind', FinancialCategoryKind.EXPENSE)}
        >
          Despesa
        </Chip>
        <Chip
          active={kind === FinancialCategoryKind.INCOME}
          onClick={() => setValue('kind', FinancialCategoryKind.INCOME)}
        >
          Receita
        </Chip>
        <Button primary type="submit" disabled={!formState.isValid || create.isPending}>
          Adicionar
        </Button>
      </form>
      <Table
        cols={['Categoria', 'Tipo', 'Origem']}
        widths="1fr 110px 90px"
        dense
        rows={categories.map((c) => ({
          key: c.id,
          cells: [
            c.name,
            c.kind === FinancialCategoryKind.INCOME ? (
              <Tag tone="ok">receita</Tag>
            ) : (
              <Tag tone="warn">despesa</Tag>
            ),
            c.system ? <Tag tone="dim">sistema</Tag> : '—',
          ],
        }))}
      />
    </Card>
  );
}
