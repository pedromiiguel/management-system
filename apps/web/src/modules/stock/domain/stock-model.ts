import type {
  StockAdjustmentInput,
  StockEntryInput,
  StockMovementSource,
  StockMovementType,
} from '@beverage/shared';
import type { IProduct } from '@modules/products/domain/product-model';

export interface IStockAlerts {
  lowStock: Pick<IProduct, 'id' | 'name' | 'sku' | 'currentStock' | 'minimumStock'>[];
  expiring: IExpiringBatch[];
}

export interface IExpiringBatch {
  id: string;
  batch: string | null;
  expiresAt: string | null;
  quantity: number;
  product: Pick<IProduct, 'id' | 'name' | 'sku'>;
}

export interface IStockMovement {
  id: string;
  type: StockMovementType;
  source: StockMovementSource;
  quantity: number;
  note: string | null;
  createdAt: string;
  product: Pick<IProduct, 'name' | 'sku' | 'unit'>;
}

export type TStockEntryParams = StockEntryInput;
export type TStockAdjustmentParams = StockAdjustmentInput;
