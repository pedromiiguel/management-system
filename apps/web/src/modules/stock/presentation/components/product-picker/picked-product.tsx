import type { TPickedProductProps } from './types';

export function PickedProduct({ product }: TPickedProductProps) {
  return (
    <div className="s-kv">
      <span>Produto</span>
      <b>
        {product.name} (estoque: {product.currentStock})
      </b>
    </div>
  );
}
