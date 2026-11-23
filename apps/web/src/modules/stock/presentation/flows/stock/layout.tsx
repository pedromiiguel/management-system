import {
  STOCK_MOVEMENT_SOURCE_LABELS,
  STOCK_MOVEMENT_TYPE_LABELS,
  StockMovementType,
} from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Screen } from '@presentation/components/Screen';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatDateOnly, formatDateTime } from '@presentation/utils/format';
import { StockAdjustmentFlow } from '../stock-adjustment';
import { StockEntryFlow } from '../stock-entry';
import type { TStockLayoutProps } from './types';

export function StockLayout({
  movements,
  alerts,
  modal,
  onEntryClick,
  onAdjustmentClick,
  onModalClose,
}: TStockLayoutProps) {
  return (
    <Screen
      title="Estoque"
      topRight={
        <>
          <Button ghost onClick={onAdjustmentClick}>
            Ajuste manual
          </Button>
          <Button primary onClick={onEntryClick}>
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
            rows={movements.map((movement) => {
              const isEntry = movement.type === StockMovementType.ENTRY;
              return {
                key: movement.id,
                cells: [
                  formatDateTime(movement.createdAt),
                  <span key="p">
                    {movement.product.name}
                    {movement.note ? <span className="s-dim"> — {movement.note}</span> : null}
                  </span>,
                  <Tag key="t" tone={isEntry ? 'ok' : 'dim'}>
                    {STOCK_MOVEMENT_TYPE_LABELS[movement.type].toLowerCase()}
                  </Tag>,
                  STOCK_MOVEMENT_SOURCE_LABELS[movement.source],
                  <b key="q">
                    {isEntry ? '+' : '−'}
                    {movement.quantity}
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
              rows={(alerts?.lowStock ?? []).map((product) => ({
                key: product.id,
                cells: [
                  product.name,
                  <b className="s-low">{product.currentStock}</b>,
                  product.minimumStock,
                ],
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
              rows={(alerts?.expiring ?? []).map((batch) => ({
                key: batch.id,
                cells: [
                  batch.product.name,
                  batch.batch ?? '—',
                  <Tag tone="warn">{formatDateOnly(batch.expiresAt)}</Tag>,
                  batch.quantity,
                ],
              }))}
            />
          </Card>
        </div>
      </div>

      {modal === 'entry' ? <StockEntryFlow onClose={onModalClose} /> : null}
      {modal === 'adjustment' ? <StockAdjustmentFlow onClose={onModalClose} /> : null}
    </Screen>
  );
}
