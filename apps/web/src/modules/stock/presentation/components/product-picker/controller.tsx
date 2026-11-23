import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { productSearchQuery } from '@modules/products/main/products-queries';
import { MIN_SEARCH_LENGTH, NOT_FOUND_TEXT, RESULT_LIMIT } from './constants';
import { ProductPickerLayout } from './layout';
import type { TPickedProduct, TProductPickerProps } from './types';

/**
 * Modal de estoque em dois passos: primeiro escolhe o produto, depois mostra
 * o formulário de `children` para ele (com "Trocar produto" voltando à busca).
 */
export function ProductPickerController({
  title,
  width,
  searchHint,
  onClose,
  children,
}: TProductPickerProps) {
  const [pickedState, setPickedState] = useState<TPickedProduct | null>(null);
  const [searchState, setSearchState] = useState('');
  const hasSearch = searchState.length >= MIN_SEARCH_LENGTH;
  const { data: results = [] } = useQuery({
    ...productSearchQuery(searchState, RESULT_LIMIT),
    enabled: !pickedState && hasSearch,
  });

  return (
    <ProductPickerLayout
      title={title}
      width={width}
      search={searchState}
      emptyText={hasSearch ? NOT_FOUND_TEXT : searchHint}
      results={results}
      pickedContent={pickedState ? children(pickedState, () => setPickedState(null)) : null}
      onSearchChange={setSearchState}
      onProductClick={setPickedState}
      onClose={onClose}
    />
  );
}
