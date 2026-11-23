import { Screen } from '@presentation/components/Screen';
import { SegmentedControl } from '@presentation/components/SegmentedControl';
import { TABS } from './constants';
import type { TSettingsLayoutProps, TSettingsTab } from './types';

const TAB_ITEMS = [...TABS];

export function SettingsLayout({
  title,
  activeTab,
  TabContent,
  onTabChange,
}: TSettingsLayoutProps) {
  return (
    <Screen title={title}>
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl<TSettingsTab>
          items={TAB_ITEMS}
          active={activeTab}
          onChange={onTabChange}
        />
        <TabContent />
      </div>
    </Screen>
  );
}
