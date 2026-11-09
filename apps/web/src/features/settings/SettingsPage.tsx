import { useState } from 'react';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { CategoriesTab } from '@/features/financial/CategoriesTab';
import { AccessTab } from '@/features/users/AccessTab';
import { GeneralTab } from './GeneralTab';

const TABS = [
  { id: 'general', label: 'Geral', Component: GeneralTab },
  { id: 'access', label: 'Usuários & Perfis', Component: AccessTab },
  { id: 'categories', label: 'Categorias financeiras', Component: CategoriesTab },
] as const;

type Tab = (typeof TABS)[number]['id'];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>('general');
  const { Component } = TABS.find((t) => t.id === tab)!;

  return (
    <Screen title={tab === 'access' ? 'Usuários & Perfis' : 'Configurações'}>
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl<Tab> items={[...TABS]} active={tab} onChange={setTab} />
        <Component />
      </div>
    </Screen>
  );
}
