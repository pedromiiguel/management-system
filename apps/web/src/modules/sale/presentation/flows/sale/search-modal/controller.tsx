import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useDebounce } from '@presentation/hooks/use-debounce';
import { productSearchQuery } from '@modules/products/main/products-queries';
import { SearchModalLayout } from './layout';
import type { TSearchModalProps } from './types';

const RESULT_LIMIT = 8;

/** Buscar produto (F2, ou código sem cadastro exato): Enter pega o primeiro. */
export function SearchModalController({ initialQuery = '', onPick, onClose }: TSearchModalProps) {
  const [searchState, setSearchState] = useState(initialQuery);
  const term = useDebounce(searchState, 300);
  const { data: results = [] } = useQuery(productSearchQuery(term, RESULT_LIMIT));
  const emptyText = searchState.length >= 2 ? 'Nada encontrado' : 'Digite ao menos 2 caracteres';

  return (
    <SearchModalLayout
      search={searchState}
      results={results}
      emptyText={emptyText}
      onSearchChange={setSearchState}
      onSubmit={() => {
        if (results[0]) onPick(results[0]);
      }}
      onPick={onPick}
      onClose={onClose}
    />
  );
}
