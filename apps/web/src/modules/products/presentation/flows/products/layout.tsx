import { Search, Trash2 } from 'lucide-react';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Chip } from '@presentation/components/Chip';
import { IconButton } from '@presentation/components/IconButton';
import { Pager } from '@presentation/components/Pager';
import { Screen } from '@presentation/components/Screen';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatBRL } from '@presentation/utils/format';
import { CATALOG_PAGE_SIZE } from '@modules/products/main/products-queries';
import { StockEntryFlow } from '@modules/stock/presentation/flows/stock-entry';
import { ProductFormFlow } from '../product-form';
import { TABLE_ALIGN, TABLE_COLUMNS, TABLE_WIDTHS } from './constants';
import type { TProductsLayoutProps } from './types';

export function ProductsLayout({
  search,
  filter,
  page,
  total,
  lowStockCount,
  expiringCount,
  rows,
  modal,
  onSearchChange,
  onFilterClick,
  onPageChange,
  onNewProductClick,
  onEntryClick,
  onProductClick,
  onDeleteClick,
  onModalClose,
}: TProductsLayoutProps) {
  return (
    <Screen
      title="Produtos & Estoque"
      topRight={
        <>
          <Button ghost onClick={onEntryClick}>
            Entrada de estoque
          </Button>
          <Button primary onClick={onNewProductClick}>
            + Novo produto
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 h-full">
        <div className="flex gap-2.5 items-center">
          <div className="s-input w-[400px]">
            <Search size={15} />
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar por nome, SKU ou código de barras…"
            />
          </div>
          <Chip active={filter === 'all'} onClick={() => onFilterClick('all')}>
            Todos · {total}
          </Chip>
          <Chip active={filter === 'active'} onClick={() => onFilterClick('active')}>
            Ativos
          </Chip>
          <Chip active={filter === 'low'} onClick={() => onFilterClick('low')}>
            Estoque baixo · {lowStockCount}
          </Chip>
          <Chip active={filter === 'expiring'} onClick={() => onFilterClick('expiring')}>
            Vencimento próximo · {expiringCount}
          </Chip>
        </div>

        <Card pad={8} className="flex-1 min-h-0 overflow-auto">
          <Table
            cols={TABLE_COLUMNS}
            widths={TABLE_WIDTHS}
            align={[...TABLE_ALIGN]}
            dense
            rows={rows.map(({ product, isLowStock, status }) => ({
              key: product.id,
              onClick: () => onProductClick(product),
              cells: [
                product.sku,
                product.ean ?? '—',
                product.name,
                formatBRL(product.salePrice),
                isLowStock ? <b className="s-low">{product.currentStock}</b> : product.currentStock,
                product.minimumStock,
                <Tag key="status" tone={status.tone}>
                  {status.label}
                </Tag>,
                <IconButton
                  key="del"
                  icon={Trash2}
                  danger
                  title="Excluir produto"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDeleteClick(product);
                  }}
                />,
              ],
            }))}
          />
        </Card>

        <div className="flex justify-between items-center">
          <span className="s-dim text-[12.5px]">
            Produtos com venda registrada não são excluídos — apenas desativados.
          </span>
          <Pager page={page} total={total} perPage={CATALOG_PAGE_SIZE} onChange={onPageChange} />
        </div>
      </div>

      {modal.kind === 'product' ? (
        <ProductFormFlow product={modal.product} onClose={onModalClose} />
      ) : null}
      {modal.kind === 'entry' ? <StockEntryFlow onClose={onModalClose} /> : null}
    </Screen>
  );
}
