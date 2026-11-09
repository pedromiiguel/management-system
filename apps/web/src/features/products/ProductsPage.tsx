import { useQuery } from '@tanstack/react-query';
import { Search, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { dateOnlyKey, daysBetweenKeys } from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Confirm } from '@/components/Confirm';
import { IconButton } from '@/components/IconButton';
import { Screen } from '@/components/Screen';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/lib/toast';
import { formatBRL, todayKey } from '@/lib/format';
import { stockAlertsQuery, type StockAlerts } from '@/features/stock/api';
import { StockEntryModal } from '@/features/stock/StockEntryModal';
import { CATALOG_PAGE_SIZE, catalogQuery, useDeleteProduct, type Product } from './api';
import { ProductModal } from './ProductModal';

type Filter = 'all' | 'active' | 'low' | 'expiring';

type ModalState = { kind: 'none' } | { kind: 'product'; product?: Product } | { kind: 'entry' };

/** Primeiro lote a vencer de cada produto, como rótulo ("vence em 3d"). */
function expiryLabels(alerts: StockAlerts | undefined): Map<string, string> {
  const labels = new Map<string, string>();
  for (const batch of alerts?.expiring ?? []) {
    if (batch.expiresAt && !labels.has(batch.product.id)) {
      const days = daysBetweenKeys(todayKey(), dateOnlyKey(batch.expiresAt));
      labels.set(batch.product.id, days <= 0 ? 'vencido' : `vence em ${days}d`);
    }
  }
  return labels;
}

export function ProductsPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  const { data } = useQuery(catalogQuery(search, page));
  const { data: alerts } = useQuery(stockAlertsQuery());
  const deleteProduct = useDeleteProduct();

  const lowIds = new Set(alerts?.lowStock.map((p) => p.id));
  const expiring = expiryLabels(alerts);
  const expiringIds = new Set(alerts?.expiring.map((b) => b.product.id));

  // Filtro sobre a página atual (a API não filtra por alerta).
  const products = (data?.items ?? []).filter((p) => {
    if (filter === 'active') return p.active;
    if (filter === 'low') return lowIds.has(p.id);
    if (filter === 'expiring') return expiringIds.has(p.id);
    return true;
  });

  async function remove(product: Product) {
    const confirmed = await Confirm.call({
      title: 'Excluir produto?',
      message: `Tem certeza que deseja excluir ${product.name}? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
      danger: true,
    });
    if (!confirmed) return;
    deleteProduct.mutate(product.id, { onSuccess: () => toast('Produto excluído') });
  }

  function status(product: Product) {
    if (!product.active) return <Tag tone="dim">inativo</Tag>;
    const expiry = expiring.get(product.id);
    if (expiry) return <Tag tone="warn">{expiry}</Tag>;
    if (lowIds.has(product.id)) return <Tag tone="warn">estoque baixo</Tag>;
    return <Tag tone="ok">ativo</Tag>;
  }

  const closeModal = () => setModal({ kind: 'none' });
  const total = data?.total ?? 0;

  return (
    <Screen
      title="Produtos & Estoque"
      topRight={
        <>
          <Button ghost onClick={() => setModal({ kind: 'entry' })}>
            Entrada de estoque
          </Button>
          <Button primary onClick={() => setModal({ kind: 'product' })}>
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
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, SKU ou código de barras…"
            />
          </div>
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            Todos · {total}
          </Chip>
          <Chip active={filter === 'active'} onClick={() => setFilter('active')}>
            Ativos
          </Chip>
          <Chip active={filter === 'low'} onClick={() => setFilter('low')}>
            Estoque baixo · {alerts?.lowStock.length ?? 0}
          </Chip>
          <Chip active={filter === 'expiring'} onClick={() => setFilter('expiring')}>
            Vencimento próximo · {expiringIds.size}
          </Chip>
        </div>

        <Card pad={8} className="flex-1 min-h-0 overflow-auto">
          <Table
            cols={[
              'SKU',
              'Código de barras',
              'Produto',
              'Preço venda',
              'Estoque',
              'Mín.',
              'Situação',
              'Ações',
            ]}
            widths="80px 140px 1fr 110px 80px 60px 150px 60px"
            align={[null, null, null, 'right', 'center', 'center', null, 'center']}
            dense
            rows={products.map((p) => ({
              key: p.id,
              onClick: () => setModal({ kind: 'product', product: p }),
              cells: [
                p.sku,
                p.ean ?? '—',
                p.name,
                formatBRL(p.salePrice),
                lowIds.has(p.id) ? <b className="s-low">{p.currentStock}</b> : p.currentStock,
                p.minimumStock,
                status(p),
                <IconButton
                  key="del"
                  icon={Trash2}
                  danger
                  title="Excluir produto"
                  onClick={(e) => {
                    e.stopPropagation();
                    void remove(p);
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
          <span className="flex gap-1.5 items-center">
            <Button ghost disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ‹
            </Button>
            <span className="s-dim text-[13px]">página {page}</span>
            <Button
              ghost
              disabled={total <= page * CATALOG_PAGE_SIZE}
              onClick={() => setPage((p) => p + 1)}
            >
              ›
            </Button>
          </span>
        </div>
      </div>

      {modal.kind === 'product' && <ProductModal product={modal.product} onClose={closeModal} />}
      {modal.kind === 'entry' && <StockEntryModal onClose={closeModal} />}
    </Screen>
  );
}
