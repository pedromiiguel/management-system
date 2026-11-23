import { useQuery } from '@tanstack/react-query';
import { useState, type KeyboardEvent } from 'react';
import { useDebounce } from '@presentation/hooks/use-debounce';
import type { IProduct } from '@modules/products/domain/product-model';
import { productSearchQuery } from '@modules/products/main/products-queries';
import { MIN_SUGGESTION_LENGTH, SUGGESTION_DEBOUNCE_MS, SUGGESTION_LIMIT } from './constants';
import { ScanBoxLayout } from './layout';
import type { TScanBoxProps } from './types';

/**
 * Campo de código: vive focado (scanner USB emula teclado + Enter) e sugere
 * produtos por nome/SKU enquanto se digita (FR-11).
 */
export function ScanBoxController({ inputRef, value, onChange, onSubmit, onPick }: TScanBoxProps) {
  const [activeState, setActiveState] = useState(0);
  const typed = value.trim();
  const term = useDebounce(typed, SUGGESTION_DEBOUNCE_MS);
  const { data = [] } = useQuery(productSearchQuery(term, SUGGESTION_LIMIT));
  // Só sugere o que é do texto atual: um código bipado antes de a busca alcançar
  // o campo não pode ser trocado, no Enter, pela sugestão da busca anterior.
  const open = typed.length >= MIN_SUGGESTION_LENGTH && term === typed && data.length > 0;
  const suggestions = open ? data : [];
  const highlighted = Math.min(activeState, suggestions.length - 1);

  function pick(product: IProduct) {
    onPick(product);
    setActiveState(0);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (open && event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveState(Math.min(highlighted + 1, suggestions.length - 1));
    } else if (open && event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveState(Math.max(highlighted - 1, 0));
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
    <ScanBoxLayout
      inputRef={inputRef}
      value={value}
      suggestions={suggestions}
      highlighted={highlighted}
      onChange={(next) => {
        onChange(next);
        setActiveState(0);
      }}
      onKeyDown={handleKeyDown}
      onPick={pick}
    />
  );
}
