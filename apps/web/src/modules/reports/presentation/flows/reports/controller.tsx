import { useState } from 'react';
import { downloadBlob } from '@presentation/utils/download';
import { monthToDate } from '@presentation/utils/format';
import { useExportReportCsv } from '@modules/reports/main/reports-queries';
import { TABS } from './constants';
import { ReportsLayout } from './layout';

export function ReportsController() {
  const [tabIdState, setTabIdState] = useState('sales');
  const [periodState, setPeriodState] = useState(monthToDate);
  const activeTab = TABS.find((tab) => tab.id === tabIdState)!;
  const exportCsv = useExportReportCsv();

  const handleExportCsvClick = () =>
    exportCsv.mutate(
      { kind: activeTab.exportKind, period: periodState },
      {
        onSuccess: (blob) =>
          downloadBlob(
            blob,
            `relatorio-${activeTab.id}-${periodState.from}-a-${periodState.to}.csv`,
          ),
      },
    );

  return (
    <ReportsLayout
      activeTab={activeTab}
      period={periodState}
      isExporting={exportCsv.isPending}
      onTabChange={setTabIdState}
      onPeriodChange={setPeriodState}
      onExportCsvClick={handleExportCsvClick}
      onExportPdfClick={() => window.print()}
    />
  );
}
