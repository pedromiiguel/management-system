import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { ScanBarcode } from 'lucide-react';
import { useState, type KeyboardEvent, type RefObject } from 'react';
import { Kbd } from '@/components/Kbd';
import { formatBRL } from '@/lib/format';
import { useDebounce } from '@/lib/useDebounce';
import { productSearchQuery, type Product } from '@/features/products/api';
import { SALE_HOTKEYS } from './hotkeys';

const SUGGESTION_LIMIT = 6;

/**
 * Campo de código: vive focado (scanner USB emula teclado + Enter) e sugere
 * produtos por nome/SKU enquanto se digita (FR-11).
 */
export function ScanBox({
  inputRef,
  value,
  onChange,
  onSubmit,
  onPick,
}: {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  /** Enter sem sugestão aberta: bipa o que foi digitado. */
  onSubmit: () => void;
  onPick: (product: Product) => void;
}) {
  const [active, setActive] = useState(0);
  const term = useDebounce(value.trim(), 200);
  const { data: suggestions = [] } = useQuery(productSearchQuery(term, SUGGESTION_LIMIT));
  const open = value.trim().length >= 2 && suggestions.length > 0;
  const highlighted = Math.min(active, suggestions.length - 1);

  function pick(product: Product) {
    onPick(product);
    setActive(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (open && event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(Math.min(highlighted + 1, suggestions.length - 1));
    } else if (open && event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(Math.max(highlighted - 1, 0));
    } else if (open && event.key === 'Escape') {
      // Fecha só as sugestões; sem isso o Esc global pediria para cancelar a venda.
      event.preventDefault();
      event.stopPropagation();
      onChange('');
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (open) pick(suggestions[highlighted]!);
      else onSubmit();
    }
  }

  return (
    <div className="relative">
      <div className="s-scan">
        <ScanBarcode size={22} />
        <input
          ref={inputRef}
          autoFocus
          aria-label="Código de barras, SKU ou nome do produto"
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setActive(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Passe o código de barras ou digite o nome / SKU…"
        />
        <Kbd>{SALE_HOTKEYS.search.label}</Kbd>
      </div>
      {open ? (
        <div className="s-suggest" role="listbox" aria-label="Sugestões de produto">
          {suggestions.map((product, index) => (
            <div
              key={product.id}
              role="option"
              aria-selected={index === highlighted}
              className={clsx('s-suggest-item', index === highlighted && 'is-active')}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => pick(product)}
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
