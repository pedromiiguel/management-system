import type { ComponentType } from 'react';
import type { TABS } from './constants';

export type TSettingsTab = (typeof TABS)[number]['id'];

export type TSettingsLayoutProps = {
  title: string;
  activeTab: TSettingsTab;
  TabContent: ComponentType;
  onTabChange: (tab: TSettingsTab) => void;
};
