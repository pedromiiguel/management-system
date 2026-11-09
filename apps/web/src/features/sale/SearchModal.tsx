import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { formatBRL } from '@/lib/format';
import { useDebounce } from '@/lib/useDebounce';
import { productSearchQuery, type Product } from '@/features/products/api';
import { SALE_HOTKEYS } from './hotkeys';

const RESULT_LIMIT = 8;

export function SearchModal({
  initialQuery = '',
  onPick,
  onClose,
}: {
  initialQuery?: string;
  onPick: (product: Product) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState(initialQuery);
  const term = useDebounce(search, 300);
  const { data: results = [] } = useQuery(productSearchQuery(term, RESULT_LIMIT));

  return (
    <Modal title={`Buscar produto (${SALE_HOTKEYS.search.label})`} onClose={onClose} width={480}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (results[0]) onPick(results[0]);
        }}
      >
        <div className="s-input mb-2.5">
          <Search size={15} />
          <input
            autoFocus
            placeholder="Nome, SKU ou código de barras…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </form>
      <Table
        cols={['Produto', 'Estoque', 'Preço']}
        widths="1fr 70px 90px"
        align={[null, 'center', 'right']}
        dense
        emptyText={search.length >= 2 ? 'Nada encontrado' : 'Digite ao menos 2 caracteres'}
        rows={results.map((product) => ({
          key: product.id,
          onClick: () => onPick(product),
          cells: [product.name, product.currentStock, formatBRL(product.salePrice)],
        }))}
      />
    </Modal>
  );
}
