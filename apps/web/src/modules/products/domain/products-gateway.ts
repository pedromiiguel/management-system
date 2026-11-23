import type { IPaginated } from '@domain/models/paginated-model';
import type { IProduct, ISearchProductsParams, TSaveProductParams } from './product-model';

export interface IProductsGateway {
  search: (params: ISearchProductsParams) => Promise<IPaginated<IProduct>>;
  /** Cadastra ou edita, conforme houver `id`. */
  save: (params: TSaveProductParams) => Promise<IProduct>;
  deactivate: (id: string) => Promise<IProduct>;
  /** Excluir: apaga o cadastro (a API recusa produto com venda registrada). */
  delete: (id: string) => Promise<void>;
}
