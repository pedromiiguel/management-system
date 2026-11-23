import { useState } from 'react';
import { STORE_TIME_ZONE } from '@beverage/shared';
import { TABS } from './constants';
import { FinancialLayout } from './layout';
import type { TFinancialTab } from './types';

const MONTH_LABEL_FORMAT = { timeZone: STORE_TIME_ZONE, month: 'long', year: 'numeric' } as const;

export function FinancialController() {
  const [activeTabState, setActiveTabState] = useState<TFinancialTab>('overview');
  const activeTab = TABS.find((tab) => tab.id === activeTabState)!;

  return (
    <FinancialLayout
      monthLabel={new Date().toLocaleDateString('pt-BR', MONTH_LABEL_FORMAT)}
      activeTab={activeTabState}
      TabContent={activeTab.Component}
      onTabChange={setActiveTabState}
    />
  );
}
