import type { ReactNode } from 'react';

export type CategoryRowView = { key: string; cells: ReactNode[] };

export type CategoryKind = 'INCOME' | 'EXPENSE';

export type CategoriesTabViewProps = {
  name: string;
  onChangeName: (value: string) => void;
  kind: CategoryKind;
  onSelectKind: (kind: CategoryKind) => void;
  canCreate: boolean;
  onSubmit: () => void;
  rows: CategoryRowView[];
};
