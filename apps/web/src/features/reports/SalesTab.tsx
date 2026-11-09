import {
  PAYMENT_METHOD_LABELS,
  SALE_STATUS_LABELS,
  saleCode,
  SaleStatus,
  SERVICE_FEE_PERCENT,
} from '@beverage/shared';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { BarChart } from '@/components/BarChart';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { StatCard } from '@/components/StatCard';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/components/Toast';
import { formatBRL, formatDateTime } from '@/lib/format';
import { salesHistoryQuery, useVoidSale, type Sale } from '@/features/sale/api';
import { SaleDetailModal } from '@/features/sale/SaleDetailModal';
import { salesReportQuery } from './api';

export function SalesTab({ from, to }: { from: string; to: string }) {
  const { data: report } = useQuery(salesReportQuery(from, to));
  const { data: history } = useQuery(salesHistoryQuery(from, to));
  const sales = history?.items ?? [];
  const days = report?.days ?? [];
  const [detail, setDetail] = useState<Sale | null>(null);
  const [voiding, setVoiding] = useState<Sale | null>(null);
  const voidSale = useVoidSale();

  const voided = sales.filter((s) => s.status === SaleStatus.VOIDED).length;
  const ticket = report && report.count > 0 ? report.revenue / report.count : 0;

  const confirmVoid = (sale: Sale) =>
    voidSale.mutate(sale.id, {
      onSuccess: () => {
        toast('Venda estornada — estoque e receita revertidos (BR-05)');
        setVoiding(null);
      },
    });

  return (
    <>
      <div className="flex gap-3">
        <StatCard
          label="Receita no período"
          value={formatBRL(report?.revenue)}
          sub="produtos, líquida de taxa de serviço"
        />
        <StatCard
          label="Taxa de serviço"
          value={formatBRL(report?.serviceFee)}
          sub={`${SERVICE_FEE_PERCENT}% do subtotal — fica com a casa`}
        />
        <StatCard label="Nº de vendas" value={report?.count ?? 0} />
        <StatCard label="Ticket médio" value={formatBRL(ticket)} />
        <StatCard label="Estornadas" value={voided} sub="itens devolvidos ao estoque" />
      </div>
      <Card>
        <div className="s-card-title">
          Receita por dia <span className="s-dim font-normal">(R$)</span>
        </div>
        <BarChart
          values={days.map((d) => d.revenue)}
          labels={days.map((d) => d.day.slice(8))}
          height={110}
          hl={days.length - 1}
        />
        {days.length === 0 && <div className="s-dim text-[12.5px]">Sem vendas no período.</div>}
      </Card>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['Data/hora', 'Venda', 'Itens', 'Pagamento', 'NF', 'Total', '']}
          widths="130px 90px 60px 1fr 60px 110px 100px"
          align={[null, null, 'center', null, 'center', 'right', 'right']}
          dense
          emptyText="Nenhuma venda no período"
          rows={sales.map((s) => ({
            key: s.id,
            onClick: () => setDetail(s),
            cells: [
              formatDateTime(s.completedAt ?? s.cancelledAt),
              `#${saleCode(s.id)}`,
              s.items.reduce((acc, i) => acc + i.quantity, 0),
              s.paymentMethod ? PAYMENT_METHOD_LABELS[s.paymentMethod] : '—',
              s.withInvoice ? 'sim' : 'não',
              <b key="t">{formatBRL(s.total)}</b>,
              s.status === SaleStatus.COMPLETED ? (
                // o span impede que o clique no Estornar também abra o detalhe
                <span key="a" onClick={(e) => e.stopPropagation()}>
                  <Button ghost danger onClick={() => setVoiding(s)}>
                    Estornar
                  </Button>
                </span>
              ) : (
                <Tag key="a" tone="danger">
                  {SALE_STATUS_LABELS[s.status].toLowerCase()}
                </Tag>
              ),
            ],
          }))}
        />
      </Card>
      {detail && <SaleDetailModal sale={detail} onClose={() => setDetail(null)} />}
      {voiding && (
        <Modal title={`Estornar venda #${saleCode(voiding.id)}?`} onClose={() => setVoiding(null)}>
          <div className="s-dim text-[13.5px] mb-4">
            Os itens voltam ao estoque e o valor é deduzido da receita (BR-05). O histórico é
            preservado para auditoria.
          </div>
          <div className="flex gap-2 justify-end">
            <Button ghost onClick={() => setVoiding(null)}>
              Voltar
            </Button>
            <Button danger disabled={voidSale.isPending} onClick={() => confirmVoid(voiding)}>
              Estornar venda
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
