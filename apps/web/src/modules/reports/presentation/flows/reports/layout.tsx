import { Fragment } from 'react';
import { Button } from '@presentation/components/Button';
import { PeriodPicker } from '@presentation/components/PeriodPicker';
import { Screen } from '@presentation/components/Screen';
import { SegmentedControl } from '@presentation/components/SegmentedControl';
import { TABS } from './constants';
import type { TReportsLayoutProps } from './types';

export function ReportsLayout({
  activeTab,
  period,
  isExporting,
  onTabChange,
  onPeriodChange,
  onExportCsvClick,
  onExportPdfClick,
}: TReportsLayoutProps) {
  const exportButton = (
    <Button ghost disabled={isExporting} onClick={onExportCsvClick}>
      Exportar CSV
    </Button>
  );

  return (
    <Screen title="Relatórios">
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl items={TABS} active={activeTab.id} onChange={onTabChange} />
        {activeTab.usesPeriod ? (
          <div className="flex gap-2.5 items-end">
            <PeriodPicker value={period} onChange={onPeriodChange} />
            <span className="flex-1" />
            {exportButton}
            <Button ghost onClick={onExportPdfClick}>
              Exportar PDF
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">{exportButton}</div>
        )}
        {/* key: período novo volta o histórico de vendas à página 1 */}
        <Fragment key={`${activeTab.id}|${period.from}|${period.to}`}>
          {activeTab.render(period)}
        </Fragment>
      </div>
    </Screen>
  );
}
