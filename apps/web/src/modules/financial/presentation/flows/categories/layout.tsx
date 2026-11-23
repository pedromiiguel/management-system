import { FinancialCategoryKind } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Chip } from '@presentation/components/Chip';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import type { TCategoriesLayoutProps } from './types';

export function CategoriesLayout({
  categories,
  register,
  kind,
  canSubmit,
  onKindClick,
  onSubmit,
}: TCategoriesLayoutProps) {
  return (
    <Card className="max-w-[560px]">
      <div className="s-card-title">Categorias de receitas e despesas</div>
      <form className="flex gap-2 mb-3" onSubmit={onSubmit}>
        <div className="s-input flex-1">
          <input data-testid="category-name" placeholder="Nova categoria…" {...register('name')} />
        </div>
        <Chip
          active={kind === FinancialCategoryKind.EXPENSE}
          onClick={() => onKindClick(FinancialCategoryKind.EXPENSE)}
        >
          Despesa
        </Chip>
        <Chip
          active={kind === FinancialCategoryKind.INCOME}
          onClick={() => onKindClick(FinancialCategoryKind.INCOME)}
        >
          Receita
        </Chip>
        <Button primary type="submit" disabled={!canSubmit}>
          Adicionar
        </Button>
      </form>
      <Table
        cols={['Categoria', 'Tipo', 'Origem']}
        widths="1fr 110px 90px"
        dense
        rows={categories.map((category) => ({
          key: category.id,
          cells: [
            category.name,
            category.kind === FinancialCategoryKind.INCOME ? (
              <Tag tone="ok">receita</Tag>
            ) : (
              <Tag tone="warn">despesa</Tag>
            ),
            category.system ? <Tag tone="dim">sistema</Tag> : '—',
          ],
        }))}
      />
    </Card>
  );
}
