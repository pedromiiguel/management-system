import { BarChart } from '@/presentation/components/BarChart';
import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import { Modal } from '@/presentation/components/Modal';
import { StatCard } from '@/presentation/components/StatCard';
import { Table } from '@/presentation/components/Table';
import { SaleDetailModal } from './components/SaleDetailModal';
import type { SalesTabViewProps } from './SalesTab.types';

export function SalesTabView({
  revenue,
  serviceFeeTotal,
  count,
  ticket,
  cancelled,
  dayValues,
  dayLabels,
  rows,
  detail,
  onCloseDetail,
  voiding,
  onCancelVoid,
  onConfirmVoid,
  isVoiding,
}: SalesTabViewProps) {
  return (
    <>
      <div className="flex gap-3">
        <StatCard label="Receita no período" value={revenue} sub="produtos, líquida de taxa de serviço" />
        <StatCard label="Taxa de serviço" value={serviceFeeTotal} sub="10% — fica com a casa" />
        <StatCard label="Nº de vendas" value={count} />
        <StatCard label="Ticket médio" value={ticket} />
        <StatCard label="Canceladas" value={cancelled} sub="estoque estornado automaticamente" />
      </div>
      <Card>
        <div className="s-card-title">
          Receita por dia <span className="s-dim font-normal">(R$)</span>
        </div>
        <BarChart values={dayValues} labels={dayLabels} height={110} hl={dayValues.length - 1} />
        {dayValues.length === 0 && <div className="s-dim text-[12.5px]">Sem vendas no período.</div>}
      </Card>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['Data/hora', 'Venda', 'Itens', 'Pagamento', 'NF', 'Total', '']}
          widths="130px 90px 60px 1fr 60px 110px 100px"
          align={[null, null, 'center', null, 'center', 'right', 'right']}
          dense
          emptyText="Nenhuma venda no período"
          rows={rows}
        />
      </Card>
      {detail && <SaleDetailModal sale={detail} onClose={onCloseDetail} />}
      {voiding && (
        <Modal title={`Estornar venda #${voiding.id.slice(-6).toUpperCase()}?`} onClose={onCancelVoid}>
          <div className="s-dim text-[13.5px] mb-4">
            Os itens voltam ao estoque e o valor é deduzido da receita (BR-05). O histórico é
            preservado para auditoria.
          </div>
          <div className="flex gap-2 justify-end">
            <Button ghost onClick={onCancelVoid}>Voltar</Button>
            <Button danger disabled={isVoiding} onClick={onConfirmVoid}>
              Estornar venda
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
