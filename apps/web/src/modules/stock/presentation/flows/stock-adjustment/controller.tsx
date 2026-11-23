import { ProductPicker } from '../../components/product-picker';
import { SEARCH_HINT, TITLE, WIDTH } from './constants';
import { StockAdjustmentFormController } from './form/controller';
import type { TStockAdjustmentFlowProps } from './types';

/** Ajustar: corrige o saldo (para mais ou para menos) com motivo auditável. */
export function StockAdjustmentController({ onClose }: TStockAdjustmentFlowProps) {
  return (
    <ProductPicker title={TITLE} width={WIDTH} searchHint={SEARCH_HINT} onClose={onClose}>
      {(product, onChangeProduct) => (
        <StockAdjustmentFormController
          product={product}
          onChangeProduct={onChangeProduct}
          onSaved={onClose}
        />
      )}
    </ProductPicker>
  );
}
