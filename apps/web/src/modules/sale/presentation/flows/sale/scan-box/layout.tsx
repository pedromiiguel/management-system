import { clsx } from 'clsx';
import { ScanBarcode } from 'lucide-react';
import { Kbd } from '@presentation/components/Kbd';
import { formatBRL } from '@presentation/utils/format';
import { SALE_HOTKEYS } from '../constants';
import type { TScanBoxLayoutProps } from './types';

export function ScanBoxLayout({
  inputRef,
  value,
  suggestions,
  highlighted,
  onChange,
  onKeyDown,
  onPick,
}: TScanBoxLayoutProps) {
  return (
    <div className="relative">
      <div className="s-scan">
        <ScanBarcode size={22} />
        <input
          ref={inputRef}
          autoFocus
          aria-label="Código de barras, SKU ou nome do produto"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Passe o código de barras ou digite o nome / SKU…"
        />
        <Kbd>{SALE_HOTKEYS.search.label}</Kbd>
      </div>
      {suggestions.length > 0 ? (
        <div className="s-suggest" role="listbox" aria-label="Sugestões de produto">
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              role="option"
              aria-selected={index === highlighted}
              className={clsx('s-suggest-item', index === highlighted && 'is-active')}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onPick(product)}
            >
              <span>{product.name}</span>
              <span className="s-dim text-xs">
                {formatBRL(product.salePrice)} · estoque {product.currentStock}
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
