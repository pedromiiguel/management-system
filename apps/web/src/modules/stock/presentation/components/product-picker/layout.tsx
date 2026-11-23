import { Search } from 'lucide-react';
import { Modal } from '@presentation/components/Modal';
import { Table } from '@presentation/components/Table';
import type { TProductPickerLayoutProps } from './types';

export function ProductPickerLayout({
  title,
  width,
  search,
  emptyText,
  results,
  pickedContent,
  onSearchChange,
  onProductClick,
  onClose,
}: TProductPickerLayoutProps) {
  return (
    <Modal title={title} onClose={onClose} width={width}>
      {pickedContent ?? (
        <>
          <div className="s-input mb-2.5">
            <Search size={15} />
            <input
              autoFocus
              placeholder="Buscar produto…"
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <Table
            cols={['Produto', 'Estoque']}
            widths="1fr 80px"
            align={[null, 'center']}
            dense
            emptyText={emptyText}
            rows={results.map((product) => ({
              key: product.id,
              onClick: () => onProductClick(product),
              cells: [product.name, product.currentStock],
            }))}
          />
        </>
      )}
    </Modal>
  );
}
