import { ProductPicker } from '../../components/product-picker';
import { SEARCH_HINT, TITLE, WIDTH } from './constants';
import { StockEntryFormController } from './form/controller';
import type { TStockEntryFlowProps } from './types';

/** Entrada: soma ao saldo do produto, com custo e lote/validade opcionais. */
export function StockEntryController({ onClose }: TStockEntryFlowProps) {
  return (
    <ProductPicker title={TITLE} width={WIDTH} searchHint={SEARCH_HINT} onClose={onClose}>
      {(product, onChangeProduct) => (
        <StockEntryFormController
          product={product}
          onChangeProduct={onChangeProduct}
          onSaved={onClose}
        />
      )}
    </ProductPicker>
  );
}
