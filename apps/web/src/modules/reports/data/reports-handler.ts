import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { IPeriod } from '@domain/models/period-model';
import type { IReportsGateway } from '../domain/reports-gateway';
import type {
  IProductPerformance,
  ISalesReport,
  TReportKind,
  TStockPositionRow,
} from '../domain/report-model';

const URL_BY_KIND: Record<TReportKind, string> = {
  sales: '/reports/sales',
  products: '/reports/products',
  stock: '/reports/stock-position',
};

const USES_PERIOD: Record<TReportKind, boolean> = { sales: true, products: true, stock: false };

export class ReportsHandler extends BaseService implements IReportsGateway {
  getSales({ from, to }: IPeriod) {
    return this.send<ISalesReport>({
      url: URL_BY_KIND.sales,
      method: HttpMethod.GET,
      queryParams: { from, to },
    });
  }

  getProductPerformance({ from, to }: IPeriod) {
    return this.send<IProductPerformance[]>({
      url: URL_BY_KIND.products,
      method: HttpMethod.GET,
      queryParams: { from, to },
    });
  }

  getStockPosition() {
    return this.send<TStockPositionRow[]>({ url: URL_BY_KIND.stock, method: HttpMethod.GET });
  }

  exportCsv(kind: TReportKind, { from, to }: IPeriod) {
    const period = USES_PERIOD[kind] ? { from, to } : {};
    return this.send<Blob>({
      url: URL_BY_KIND[kind],
      method: HttpMethod.GET,
      queryParams: { ...period, format: 'csv' },
      responseType: 'blob',
    });
  }
}
