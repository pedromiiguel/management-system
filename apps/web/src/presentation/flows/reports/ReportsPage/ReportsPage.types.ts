export type ReportsTab = 'sales' | 'best' | 'margin' | 'stock';

export type PeriodChip = 'today' | 'week' | 'month';

export type ReportsPageViewProps = {
  tab: ReportsTab;
  onChangeTab: (tab: ReportsTab) => void;
  from: string;
  onChangeFrom: (value: string) => void;
  to: string;
  onChangeTo: (value: string) => void;
  chip: PeriodChip;
  onApplyChip: (chip: PeriodChip) => void;
  onExportCsv: () => void;
  isExportingCsv: boolean;
};
