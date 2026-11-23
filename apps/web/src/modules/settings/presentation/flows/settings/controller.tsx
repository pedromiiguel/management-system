import { useState } from 'react';
import { DEFAULT_TITLE, TABS } from './constants';
import { SettingsLayout } from './layout';
import type { TSettingsTab } from './types';

export function SettingsController() {
  const [activeTabState, setActiveTabState] = useState<TSettingsTab>('general');
  const activeTab = TABS.find((tab) => tab.id === activeTabState)!;
  // A aba de acesso dá o título da tela; as demais ficam em "Configurações".
  const title = activeTab.id === 'access' ? activeTab.label : DEFAULT_TITLE;

  return (
    <SettingsLayout
      title={title}
      activeTab={activeTabState}
      TabContent={activeTab.Component}
      onTabChange={setActiveTabState}
    />
  );
}
