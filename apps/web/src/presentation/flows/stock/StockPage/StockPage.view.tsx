import { Screen } from '@/presentation/components/Screen';
import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import { Table } from '@/presentation/components/Table';
import { AdjustModal } from '../components/AdjustModal';
import { StockEntryModal } from '../components/StockEntryModal';
import type { StockPageViewProps } from './StockPage.types';

export function StockPageView({
  movements,
  lowStock,
  expiring,
  modal,
  onOpenEntry,
  onOpenAdjust,
  onCloseModal,
  onSaved,
}: StockPageViewProps) {
  return (
    <Screen
      title="Estoque"
      topRight={
        <>
          <Button ghost onClick={onOpenAdjust}>Ajuste manual</Button>
          <Button primary onClick={onOpenEntry}>Entrada de estoque</Button>
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
            rows={movements}
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
              rows={lowStock}
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
              rows={expiring}
            />
          </Card>
        </div>
      </div>

      {modal === 'entry' && <StockEntryModal onSaved={onSaved} onClose={onCloseModal} />}
      {modal === 'adjust' && <AdjustModal onSaved={onSaved} onClose={onCloseModal} />}
    </Screen>
  );
}
