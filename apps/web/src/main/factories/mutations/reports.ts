import { useMutation } from '@tanstack/react-query';
import {
  makeExportProductPerformanceCsv,
  makeExportSalesReportCsv,
  makeExportStockPositionCsv,
} from '@/main/factories/handlers/reports';

export function useExportSalesReportCsvMutation() {
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) => makeExportSalesReportCsv().export(from, to),
  });
}

export function useExportProductPerformanceCsvMutation() {
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      makeExportProductPerformanceCsv().export(from, to),
  });
}

export function useExportStockPositionCsvMutation() {
  return useMutation({ mutationFn: () => makeExportStockPositionCsv().export() });
}
