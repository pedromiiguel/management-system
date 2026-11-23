import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { IStockGateway } from '../domain/stock-gateway';
import type {
  IStockAlerts,
  IStockMovement,
  TStockAdjustmentParams,
  TStockEntryParams,
} from '../domain/stock-model';

export class StockHandler extends BaseService implements IStockGateway {
  getAlerts() {
    return this.send<IStockAlerts>({ url: '/stock/alerts', method: HttpMethod.GET });
  }

  getMovements() {
    return this.send<IStockMovement[]>({ url: '/stock/movements', method: HttpMethod.GET });
  }

  async registerEntry(params: TStockEntryParams) {
    await this.send({ url: '/stock/entries', method: HttpMethod.POST, body: params });
  }

  async registerAdjustment(params: TStockAdjustmentParams) {
    await this.send({ url: '/stock/adjustments', method: HttpMethod.POST, body: params });
  }
}
