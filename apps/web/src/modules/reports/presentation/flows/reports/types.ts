import type { ReactNode } from 'react';
import type { IPeriod } from '@domain/models/period-model';
import type { TReportKind } from '../../../domain/report-model';

export type TReportTab = {
  id: string;
  label: string;
  usesPeriod: boolean;
  exportKind: TReportKind;
  render: (period: IPeriod) => ReactNode;
};

export type TReportsLayoutProps = {
  activeTab: TReportTab;
  period: IPeriod;
  isExporting: boolean;
  onTabChange: (tabId: string) => void;
  onPeriodChange: (period: IPeriod) => void;
  onExportCsvClick: () => void;
  onExportPdfClick: () => void;
};
