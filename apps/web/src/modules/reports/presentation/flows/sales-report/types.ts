import type { IPeriod } from '@domain/models/period-model';
import type { IPaginated } from '@domain/models/paginated-model';
import type { Sale } from '@/features/sale/api';
import type { ISalesReport } from '../../../domain/report-model';

export type TSalesReportFlowProps = { period: IPeriod };

export type TSalesReportLayoutProps = {
  report: ISalesReport | undefined;
  averageTicket: number;
  history: IPaginated<Sale> | undefined;
  page: number;
  detail: Sale | null;
  voiding: Sale | null;
  isVoiding: boolean;
  onPageChange: (page: number) => void;
  onSaleClick: (sale: Sale) => void;
  onVoidClick: (sale: Sale) => void;
  onVoidConfirm: (sale: Sale) => void;
  onDetailClose: () => void;
  onVoidClose: () => void;
};
