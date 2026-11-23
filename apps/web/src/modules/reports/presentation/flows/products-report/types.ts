import type { IPeriod } from '@domain/models/period-model';
import type { IProductPerformance } from '../../../domain/report-model';

export type TProductsReportFlowProps = { period: IPeriod; sortByMargin?: boolean };

export type TProductsReportLayoutProps = { rows: IProductPerformance[] };
