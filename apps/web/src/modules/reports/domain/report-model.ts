import type { IProduct } from '@modules/products/domain/product-model';

/** Receita (CONTEXT.md): só produtos, sem a Taxa de serviço — a taxa vem à parte. */
export interface ISalesTotals {
  count: number;
  revenue: number;
  serviceFee: number;
}

export interface ISalesReport extends ISalesTotals {
  days: (ISalesTotals & { day: string })[];
  /** Vendas estornadas no período. */
  voidedCount: number;
}

export interface IProductPerformance {
  product: Pick<IProduct, 'id' | 'name' | 'sku' | 'unit'> | null;
  quantity: number;
  /** Preço × quantidade, antes do desconto da venda — não é Receita. */
  grossSales: number;
  cost: number;
  margin: number;
  marginPercent: number;
}

export type TStockPositionRow = Pick<
  IProduct,
  'id' | 'sku' | 'name' | 'unit' | 'currentStock' | 'minimumStock'
> & {
  /** Abaixo do mínimo (FR-07) — a regra é da API. */
  low: boolean;
  stockCost: number;
  stockValue: number;
};

/** Relatórios que a API exporta em CSV, com o mesmo recorte das telas. */
export type TReportKind = 'sales' | 'products' | 'stock';
