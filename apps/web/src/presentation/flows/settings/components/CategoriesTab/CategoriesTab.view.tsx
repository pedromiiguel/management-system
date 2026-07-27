import { SBtn, SCard, SChip, STable } from '@/components/sol';
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
    <SCard className="max-w-[560px]">
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
        <SChip active={kind === 'EXPENSE'} onClick={() => onSelectKind('EXPENSE')}>
          Despesa
        </SChip>
        <SChip active={kind === 'INCOME'} onClick={() => onSelectKind('INCOME')}>
          Receita
        </SChip>
        <SBtn primary disabled={!canCreate} onClick={onSubmit}>
          Adicionar
        </SBtn>
      </div>
      <STable cols={['Categoria', 'Tipo', 'Origem']} widths="1fr 110px 90px" dense rows={rows} />
    </SCard>
  );
}
