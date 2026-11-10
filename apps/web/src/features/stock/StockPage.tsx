import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import {
  STOCK_MOVEMENT_SOURCE_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
  StockMovementType,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { formatDateOnly, formatDateTime } from '@/lib/format';
import { AdjustModal } from './AdjustModal';
import { stockAlertsQuery, stockMovementsQuery } from './api';
import { StockEntryModal } from './StockEntryModal';

export function StockPage() {
  const [modal, setModal] = useState<'none' | 'entry' | 'adjust'>('none');
  const { data: alerts } = useQuery(stockAlertsQuery());
  const { data: movements = [] } = useQuery(stockMovementsQuery());
  const closeModal = () => setModal('none');

  return (
    <Screen
      title="Estoque"
      topRight={
        <>
          <Button ghost onClick={() => setModal('adjust')}>
            Ajuste manual
          </Button>
          <Button primary onClick={() => setModal('entry')}>
            Entrada de estoque
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_350px] gap-3 h-full">
        <Card pad={8} className="min-h-0 overflow-auto">
          <div className="s-card-title pt-2 px-2.5 pb-1">Movimentações recentes</div>
          <Table
            cols={['Data', 'Produto', 'Tipo', 'Origem', 'Qtd']}
            widths="110px 1fr 80px 150px 60px"
            align={[null, null, null, null, 'center']}
            dense
            rows={movements.map((m) => {
              const entry = m.type === StockMovementType.ENTRY;
              return {
                key: m.id,
                cells: [
                  formatDateTime(m.createdAt),
                  <span key="p">
                    {m.product.name}
                    {m.note ? <span className="s-dim"> — {m.note}</span> : null}
                  </span>,
                  <Tag key="t" tone={entry ? 'ok' : 'dim'}>
                    {STOCK_MOVEMENT_TYPE_LABELS[m.type].toLowerCase()}
                  </Tag>,
                  STOCK_MOVEMENT_SOURCE_LABELS[m.source],
                  <b key="q">
                    {entry ? '+' : '−'}
                    {m.quantity}
                  </b>,
                ],
              };
            })}
          />
        </Card>

        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          <Card>
            <div className="s-card-title">Estoque abaixo do mínimo (FR-07)</div>
            <Table
              cols={['Produto', 'Atual', 'Mín.']}
              widths="1fr 60px 50px"
              align={[null, 'center', 'center']}
              dense
              emptyText="Tudo acima do mínimo ✓"
              rows={(alerts?.lowStock ?? []).map((p) => ({
                key: p.id,
                cells: [p.name, <b className="s-low">{p.currentStock}</b>, p.minimumStock],
              }))}
            />
          </Card>
          <Card>
            <div className="s-card-title">Vencimento próximo — FEFO (FR-08)</div>
            <Table
              cols={['Produto', 'Lote', 'Validade', 'Qtd']}
              widths="1fr 60px 90px 50px"
              align={[null, null, null, 'center']}
              dense
              emptyText="Nenhum lote vencendo ✓"
              rows={(alerts?.expiring ?? []).map((b) => ({
                key: b.id,
                cells: [
                  b.product.name,
                  b.batch ?? '—',
                  <Tag tone="warn">{formatDateOnly(b.expiresAt)}</Tag>,
                  b.quantity,
                ],
              }))}
            />
          </Card>
        </div>
      </div>

      {modal === 'entry' && <StockEntryModal onClose={closeModal} />}
      {modal === 'adjust' && <AdjustModal onClose={closeModal} />}
    </Screen>
  );
}
