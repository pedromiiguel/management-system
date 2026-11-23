import type { IStockAlerts } from '@modules/stock/domain/stock-model';
import type { IProduct } from '../../../domain/product-model';

export type TProductFilter = 'all' | 'active' | 'low' | 'expiring';

export type TProductsModal =
  | { kind: 'none' }
  | { kind: 'product'; product?: IProduct }
  | { kind: 'entry' };

export type TStatusTone = 'ok' | 'warn' | 'dim';

export type TProductRow = {
  product: IProduct;
  isLowStock: boolean;
  status: { label: string; tone: TStatusTone };
};

export type TAlertsForRows = Pick<IStockAlerts, 'lowStock' | 'expiring'> | undefined;

export type TProductsLayoutProps = {
  search: string;
  filter: TProductFilter;
  page: number;
  total: number;
  lowStockCount: number;
  expiringCount: number;
  rows: TProductRow[];
  modal: TProductsModal;
  onSearchChange: (search: string) => void;
  onFilterClick: (filter: TProductFilter) => void;
  onPageChange: (page: number) => void;
  onNewProductClick: () => void;
  onEntryClick: () => void;
  onProductClick: (product: IProduct) => void;
  onDeleteClick: (product: IProduct) => void;
  onModalClose: () => void;
};
