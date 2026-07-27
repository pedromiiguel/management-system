import { Screen } from '@/presentation/components/Screen';
import { SegmentedControl } from '@/presentation/components/SegmentedControl';
import { AccessTab } from '../components/AccessTab';
import { CategoriesTab } from '../components/CategoriesTab';
import { GeneralTab } from '../components/GeneralTab';
import type { SettingsPageViewProps, SettingsTab } from './SettingsPage.types';

const TABS: { id: SettingsTab; label: string }[] = [
  { id: 'general', label: 'Geral' },
  { id: 'access', label: 'Usuários & Perfis' },
  { id: 'categories', label: 'Categorias financeiras' },
];

export function SettingsPageView({ tab, onChangeTab, title }: SettingsPageViewProps) {
  return (
    <Screen title={title}>
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl<SettingsTab> items={TABS} active={tab} onChange={onChangeTab} />
        {tab === 'general' ? <GeneralTab /> : null}
        {tab === 'access' ? <AccessTab /> : null}
        {tab === 'categories' ? <CategoriesTab /> : null}
      </div>
    </Screen>
  );
}
