import { Chip } from '@presentation/components/Chip';
import { Screen } from '@presentation/components/Screen';
import { SegmentedControl } from '@presentation/components/SegmentedControl';
import { TABS } from './constants';
import type { TFinancialLayoutProps, TFinancialTab } from './types';

const TAB_ITEMS = [...TABS];

export function FinancialLayout({
  monthLabel,
  activeTab,
  TabContent,
  onTabChange,
}: TFinancialLayoutProps) {
  return (
    <Screen title="Financeiro" topRight={<Chip active>{monthLabel}</Chip>}>
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl<TFinancialTab>
          items={TAB_ITEMS}
          active={activeTab}
          onChange={onTabChange}
        />
        <TabContent />
      </div>
    </Screen>
  );
}
