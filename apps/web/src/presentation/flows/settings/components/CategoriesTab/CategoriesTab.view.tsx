import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import { Chip } from '@/presentation/components/Chip';
import { Table } from '@/presentation/components/Table';
import type { CategoriesTabViewProps } from './CategoriesTab.types';

export function CategoriesTabView({
  name,
  onChangeName,
  kind,
  onSelectKind,
  canCreate,
  onSubmit,
  rows,
}: CategoriesTabViewProps) {
  return (
    <Card className="max-w-[560px]">
      <div className="s-card-title">Categorias de receitas e despesas</div>
      <div className="flex gap-2 mb-3">
        <div className="s-input flex-1">
          <input
            data-testid="category-name"
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
            placeholder="Nova categoria…"
          />
        </div>
        <Chip active={kind === 'EXPENSE'} onClick={() => onSelectKind('EXPENSE')}>
          Despesa
        </Chip>
        <Chip active={kind === 'INCOME'} onClick={() => onSelectKind('INCOME')}>
          Receita
        </Chip>
        <Button primary disabled={!canCreate} onClick={onSubmit}>
          Adicionar
        </Button>
      </div>
      <Table cols={['Categoria', 'Tipo', 'Origem']} widths="1fr 110px 90px" dense rows={rows} />
    </Card>
  );
}
