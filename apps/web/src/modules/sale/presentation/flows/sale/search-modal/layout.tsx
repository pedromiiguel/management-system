import { Search } from 'lucide-react';
import { Modal } from '@presentation/components/Modal';
import { Table } from '@presentation/components/Table';
import { formatBRL } from '@presentation/utils/format';
import { SALE_HOTKEYS } from '../constants';
import type { TSearchModalLayoutProps } from './types';

export function SearchModalLayout({
  search,
  results,
  emptyText,
  onSearchChange,
  onSubmit,
  onPick,
  onClose,
}: TSearchModalLayoutProps) {
  return (
    <Modal title={`Buscar produto (${SALE_HOTKEYS.search.label})`} onClose={onClose} width={480}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <div className="s-input mb-2.5">
          <Search size={15} />
          <input
            autoFocus
            placeholder="Nome, SKU ou código de barras…"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </div>
      </form>
      <Table
        cols={['Produto', 'Estoque', 'Preço']}
        widths="1fr 70px 90px"
        align={[null, 'center', 'right']}
        dense
        emptyText={emptyText}
        rows={results.map((product) => ({
          key: product.id,
          onClick: () => onPick(product),
          cells: [product.name, product.currentStock, formatBRL(product.salePrice)],
        }))}
      />
    </Modal>
  );
}
