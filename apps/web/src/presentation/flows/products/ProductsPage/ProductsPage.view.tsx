import { Search } from 'lucide-react';
import { Screen } from '@/presentation/components/Screen';
import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import { Chip } from '@/presentation/components/Chip';
import { Table } from '@/presentation/components/Table';
import { ProductModal } from '../components/ProductModal';
import { StockEntryModal } from '@/presentation/flows/stock/components/StockEntryModal';
import type { ProductsPageViewProps } from './ProductsPage.types';

export function ProductsPageView({
  search,
  onChangeSearch,
  filter,
  onChangeFilter,
  total,
  lowCount,
  expiringCount,
  rows,
  page,
  hasNextPage,
  onPrevPage,
  onNextPage,
  modal,
  onOpenNewProduct,
  onOpenNewEntry,
  onCloseModal,
  onSaved,
}: ProductsPageViewProps) {
  return (
    <Screen
      title="Produtos & Estoque"
      topRight={
        <>
          <Button ghost onClick={onOpenNewEntry}>Entrada de estoque</Button>
          <Button primary onClick={onOpenNewProduct}>+ Novo produto</Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="flex gap-2.5 items-center">
          <div className="s-input w-[400px]">
            <Search size={15} />
            <input
              value={search}
              onChange={(e) => onChangeSearch(e.target.value)}
              placeholder="Buscar por nome, SKU ou código de barras…"
            />
          </div>
          <Chip active={filter === 'all'} onClick={() => onChangeFilter('all')}>
            Todos · {total}
          </Chip>
          <Chip active={filter === 'active'} onClick={() => onChangeFilter('active')}>Ativos</Chip>
          <Chip active={filter === 'low'} onClick={() => onChangeFilter('low')}>
            Estoque baixo · {lowCount}
          </Chip>
          <Chip active={filter === 'expiring'} onClick={() => onChangeFilter('expiring')}>
            Vencimento próximo · {expiringCount}
          </Chip>
        </div>

        <Card pad={8} className="flex-1 min-h-0 overflow-auto">
          <Table
            cols={['SKU', 'Código de barras', 'Produto', 'Preço venda', 'Estoque', 'Mín.', 'Situação', 'Ações']}
            widths="80px 140px 1fr 110px 80px 60px 150px 60px"
            align={[null, null, null, 'right', 'center', 'center', null, 'center']}
            dense
            rows={rows}
          />
        </Card>

        <div className="flex justify-between items-center">
          <span className="s-dim text-[12.5px]">
            Produtos com venda registrada não são excluídos — apenas desativados.
          </span>
          <span className="flex gap-1.5 items-center">
            <Button ghost disabled={page <= 1} onClick={onPrevPage}>‹</Button>
            <span className="s-dim text-[13px]">página {page}</span>
            <Button ghost disabled={!hasNextPage} onClick={onNextPage}>›</Button>
          </span>
        </div>
      </div>

      {modal.kind === 'product' && (
        <ProductModal product={modal.product} onSaved={onSaved} onClose={onCloseModal} />
      )}
      {modal.kind === 'entry' && (
        <StockEntryModal product={modal.product} onSaved={onSaved} onClose={onCloseModal} />
      )}
    </Screen>
  );
}
