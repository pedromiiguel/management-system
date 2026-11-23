import type { ProductInput, UpdateProductInput } from '@beverage/shared';

/** Produto como a API devolve; as demais telas usam recortes (`Pick`) dele. */
export interface IProduct {
  id: string;
  sku: string;
  ean: string | null;
  name: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  currentStock: number;
  minimumStock: number;
  active: boolean;
}

export interface ISearchProductsParams {
  /** Nome, SKU ou código de barras. */
  search?: string;
  page?: number;
  perPage: number;
  /** Inclui inativos (cadastro); sem isso, só ativos (PDV, Entrada, Ajuste). */
  includeInactive?: boolean;
}

export type TSaveProductParams =
  | { id: string; input: UpdateProductInput }
  | { input: ProductInput };
