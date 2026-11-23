import { queryOptions, useMutation } from '@tanstack/react-query';
import type { IPeriod } from '@domain/models/period-model';
import { rootKeys } from '@main/query/query-keys';
import type { TReportKind } from '../domain/report-model';
import { makeReportsGateway } from './reports-factory';

export const salesReportQuery = (period: IPeriod) =>
  queryOptions({
    queryKey: [...rootKeys.reports, 'sales', period.from, period.to],
    queryFn: () => makeReportsGateway().getSales(period),
  });

export const productPerformanceQuery = (period: IPeriod) =>
  queryOptions({
    queryKey: [...rootKeys.reports, 'products', period.from, period.to],
    queryFn: () => makeReportsGateway().getProductPerformance(period),
  });

export const stockPositionQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.reports, 'stock-position'],
    queryFn: () => makeReportsGateway().getStockPosition(),
  });

export function useExportReportCsv() {
  return useMutation({
    mutationFn: ({ kind, period }: { kind: TReportKind; period: IPeriod }) =>
      makeReportsGateway().exportCsv(kind, period),
  });
}
