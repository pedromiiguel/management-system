import { STag } from '@/components/sol';
import { useCategoriesTabModel } from './CategoriesTab.model';
import { CategoriesTabView } from './CategoriesTab.view';
import type { CategoryRowView } from './CategoriesTab.types';

export function CategoriesTab() {
  const { name, setName, kind, setKind, categories, saving, submit } = useCategoriesTabModel();

  const rows: CategoryRowView[] = categories.map((c) => ({
    key: c.id,
    cells: [
      c.name,
      c.kind === 'INCOME' ? (
        <STag key="k" tone="ok">
          receita
        </STag>
      ) : (
        <STag key="k" tone="warn">
          despesa
        </STag>
      ),
      c.system ? (
        <STag key="s" tone="dim">
          sistema
        </STag>
      ) : (
        '—'
      ),
    ],
  }));

  return (
    <CategoriesTabView
      name={name}
      onChangeName={setName}
      kind={kind}
      onSelectKind={setKind}
      canCreate={name.trim().length > 0 && !saving}
      onSubmit={submit}
      rows={rows}
    />
  );
}
