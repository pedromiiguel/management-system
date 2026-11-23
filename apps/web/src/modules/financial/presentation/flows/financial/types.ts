import type { ComponentType } from 'react';
import type { TABS } from './constants';

export type TFinancialTab = (typeof TABS)[number]['id'];

export type TFinancialLayoutProps = {
  monthLabel: string;
  activeTab: TFinancialTab;
  TabContent: ComponentType;
  onTabChange: (tab: TFinancialTab) => void;
};
