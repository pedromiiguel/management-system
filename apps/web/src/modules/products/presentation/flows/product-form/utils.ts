import type { IProduct } from '../../../domain/product-model';
import { NEW_PRODUCT_DEFAULTS } from './constants';
import type { TProductFormInput } from './schema';

export function productFormDefaults(product: IProduct | undefined): Partial<TProductFormInput> {
  return product ? { ...product, ean: product.ean ?? '' } : NEW_PRODUCT_DEFAULTS;
}
