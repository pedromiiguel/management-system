import { useState } from 'react';
import { toDateInput } from '@/lib/format';
import {
  useExportProductPerformanceCsvMutation,
  useExportSalesReportCsvMutation,
  useExportStockPositionCsvMutation,
} from '@/main/factories/mutations/reports';
import type { PeriodChip, ReportsTab } from './ReportsPage.types';

export function useReportsPageModel() {
  const now = new Date();
  const [tab, setTab] = useState<ReportsTab>('sales');
  const [from, setFrom] = useState(toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(toDateInput(now));
  const [chip, setChip] = useState<PeriodChip>('month');

  function applyChip(c: PeriodChip) {
    setChip(c);
    const today = new Date();
    if (c === 'today') {
      setFrom(toDateInput(today));
      setTo(toDateInput(today));
    } else if (c === 'week') {
      const start = new Date(today);
      start.setDate(start.getDate() - 6);
      setFrom(toDateInput(start));
      setTo(toDateInput(today));
    } else {
      setFrom(toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)));
      setTo(toDateInput(today));
    }
  }

  const exportSalesCsv = useExportSalesReportCsvMutation();
  const exportProductsCsv = useExportProductPerformanceCsvMutation();
  const exportStockCsv = useExportStockPositionCsvMutation();
  const isExportingCsv = exportSalesCsv.isPending || exportProductsCsv.isPending || exportStockCsv.isPending;

  // Devolve só o blob — o disparo do download (createObjectURL + <a>) é
  // mecânica de DOM e fica no ViewModel da página (ver Decisão 5 da ADR 0009).
  async function exportCsv(): Promise<Blob> {
    if (tab === 'stock') return exportStockCsv.mutateAsync();
    if (tab === 'sales') return exportSalesCsv.mutateAsync({ from, to });
    return exportProductsCsv.mutateAsync({ from, to });
  }

  return { tab, onChangeTab: setTab, from, onChangeFrom: setFrom, to, onChangeTo: setTo, chip, onApplyChip: applyChip, exportCsv, isExportingCsv };
}

export type ReportsPageModel = ReturnType<typeof useReportsPageModel>;
