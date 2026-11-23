import type { IPeriod } from '@domain/models/period-model';
import type { IPaginated } from '@domain/models/paginated-model';
import type { ISale } from '@modules/sale/domain/sale-model';
import type { ISalesReport } from '../../../domain/report-model';

export type TSalesReportFlowProps = { period: IPeriod };

export type TSalesReportLayoutProps = {
  report: ISalesReport | undefined;
  averageTicket: number;
  history: IPaginated<ISale> | undefined;
  page: number;
  detail: ISale | null;
  voiding: ISale | null;
  isVoiding: boolean;
  onPageChange: (page: number) => void;
  onSaleClick: (sale: ISale) => void;
  onVoidClick: (sale: ISale) => void;
  onVoidConfirm: (sale: ISale) => void;
  onDetailClose: () => void;
  onVoidClose: () => void;
};
