import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { productSearchQuery, type Product } from '@/features/products/api';

const RESULT_LIMIT = 6;

/**
 * Modal de estoque em dois passos: primeiro escolhe o produto, depois mostra
 * o formulário de `children` para ele (com "Trocar produto" voltando à busca).
 */
export function ProductPickerModal({
  title,
  width,
  searchHint,
  onClose,
  children,
}: {
  title: string;
  width: number;
  /** Texto da tabela vazia antes de digitar. */
  searchHint: string;
  onClose: () => void;
  children: (product: Product, changeProduct: () => void) => ReactNode;
}) {
  const [picked, setPicked] = useState<Product | null>(null);
  const [search, setSearch] = useState('');
  const { data: results = [] } = useQuery({
    ...productSearchQuery(search, RESULT_LIMIT),
    enabled: !picked && search.length >= 2,
  });

  return (
    <Modal title={title} onClose={onClose} width={width}>
      {picked ? (
        children(picked, () => setPicked(null))
      ) : (
        <>
          <div className="s-input mb-2.5">
            <Search size={15} />
            <input
              autoFocus
              placeholder="Buscar produto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Table
            cols={['Produto', 'Estoque']}
            widths="1fr 80px"
            align={[null, 'center']}
            dense
            emptyText={search.length >= 2 ? 'Nada encontrado' : searchHint}
            rows={results.map((p) => ({
              key: p.id,
              onClick: () => setPicked(p),
              cells: [p.name, p.currentStock],
            }))}
          />
        </>
      )}
    </Modal>
  );
}

export function PickedProduct({ product }: { product: Product }) {
  return (
    <div className="s-kv">
      <span>Produto</span>
      <b>
        {product.name} (estoque: {product.currentStock})
      </b>
    </div>
  );
}
