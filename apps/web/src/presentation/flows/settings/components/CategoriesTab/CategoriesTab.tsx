import { Tag } from '@/presentation/components/Tag';
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
        <Tag key="k" tone="ok">
          receita
        </Tag>
      ) : (
        <Tag key="k" tone="warn">
          despesa
        </Tag>
      ),
      c.system ? (
        <Tag key="s" tone="dim">
          sistema
        </Tag>
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
