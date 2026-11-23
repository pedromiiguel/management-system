import type { CompleteSaleBody, CustomerInput, DiscountInput } from '@beverage/shared';
import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { IPaginated } from '@domain/models/paginated-model';
import type { IPeriod } from '@domain/models/period-model';
import type { ICustomersGateway } from '../domain/customers-gateway';
import type { ISaleGateway } from '../domain/sale-gateway';
import type {
  ICustomer,
  ISale,
  TAddSaleItemInput,
  TAddSaleItemResult,
  TSaleItemResult,
} from '../domain/sale-model';

export class SaleHandler extends BaseService implements ISaleGateway {
  open() {
    return this.send<ISale>({ url: '/sales', method: HttpMethod.POST });
  }

  addItem(saleId: string, input: TAddSaleItemInput) {
    return this.send<TAddSaleItemResult>({
      url: `/sales/${saleId}/items`,
      method: HttpMethod.POST,
      body: input,
    });
  }

  updateQuantity(saleId: string, itemId: string, quantity: number) {
    return this.send<TSaleItemResult>({
      url: `/sales/${saleId}/items/${itemId}`,
      method: HttpMethod.PATCH,
      body: { quantity },
    });
  }

  removeItem(saleId: string, itemId: string) {
    return this.send<ISale>({ url: `/sales/${saleId}/items/${itemId}`, method: HttpMethod.DELETE });
  }

  setDiscount(saleId: string, discount: DiscountInput | null) {
    return this.send<ISale>({
      url: `/sales/${saleId}/discount`,
      method: HttpMethod.PUT,
      body: discount,
    });
  }

  setServiceFee(saleId: string, enabled: boolean) {
    return this.send<ISale>({
      url: `/sales/${saleId}/service-fee`,
      method: HttpMethod.PUT,
      body: { enabled },
    });
  }

  async cancel(saleId: string) {
    await this.send<unknown>({ url: `/sales/${saleId}/cancel`, method: HttpMethod.POST });
  }

  complete(saleId: string, input: CompleteSaleBody) {
    return this.send<ISale>({
      url: `/sales/${saleId}/complete`,
      method: HttpMethod.POST,
      body: input,
    });
  }

  getHistory({ from, to }: IPeriod, page: number) {
    return this.send<IPaginated<ISale>>({
      url: '/sales/history',
      method: HttpMethod.GET,
      queryParams: { from, to, page },
    });
  }

  async void(saleId: string) {
    await this.send<unknown>({ url: `/sales/${saleId}/void`, method: HttpMethod.POST });
  }
}

export class CustomersHandler extends BaseService implements ICustomersGateway {
  search(search: string) {
    return this.send<ICustomer[]>({
      url: '/customers',
      method: HttpMethod.GET,
      queryParams: { search },
    });
  }

  create(input: CustomerInput) {
    return this.send<ICustomer>({ url: '/customers', method: HttpMethod.POST, body: input });
  }
}
