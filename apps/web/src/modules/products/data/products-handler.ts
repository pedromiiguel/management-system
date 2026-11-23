import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { IPaginated } from '@domain/models/paginated-model';
import type { IProductsGateway } from '../domain/products-gateway';
import type { IProduct, ISearchProductsParams, TSaveProductParams } from '../domain/product-model';

const PRODUCTS_URL = '/products';

export class ProductsHandler extends BaseService implements IProductsGateway {
  search({ search, page, perPage, includeInactive }: ISearchProductsParams) {
    return this.send<IPaginated<IProduct>>({
      url: PRODUCTS_URL,
      method: HttpMethod.GET,
      queryParams: {
        search: search || undefined,
        page,
        perPage,
        all: includeInactive ? 'true' : undefined,
      },
    });
  }

  save(params: TSaveProductParams) {
    if ('id' in params) {
      return this.send<IProduct>({
        url: `${PRODUCTS_URL}/${params.id}`,
        method: HttpMethod.PATCH,
        body: params.input,
      });
    }
    return this.send<IProduct>({ url: PRODUCTS_URL, method: HttpMethod.POST, body: params.input });
  }

  deactivate(id: string) {
    return this.send<IProduct>({
      url: `${PRODUCTS_URL}/${id}/deactivate`,
      method: HttpMethod.PATCH,
    });
  }

  async delete(id: string) {
    await this.send({ url: `${PRODUCTS_URL}/${id}`, method: HttpMethod.DELETE });
  }
}
