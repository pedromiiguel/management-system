import {
  PAYMENT_METHOD_LABELS,
  SALE_STATUS_LABELS,
  saleCode,
  SaleStatus,
  SERVICE_FEE_PERCENT,
} from '@beverage/shared';
import { BarChart } from '@presentation/components/BarChart';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Modal } from '@presentation/components/Modal';
import { Pager } from '@presentation/components/Pager';
import { StatCard } from '@presentation/components/StatCard';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatBRL, formatDateTime } from '@presentation/utils/format';
import { SaleDetailModal } from '@/features/sale/SaleDetailModal';
import type { TSalesReportLayoutProps } from './types';
import { itemCount } from './utils';

const CHART_HEIGHT = 110;

export function SalesReportLayout({
  report,
  averageTicket,
  history,
  page,
  detail,
  voiding,
  isVoiding,
  onPageChange,
  onSaleClick,
  onVoidClick,
  onVoidConfirm,
  onDetailClose,
  onVoidClose,
}: TSalesReportLayoutProps) {
  const days = report?.days ?? [];
  const sales = history?.items ?? [];

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
        <StatCard label="Ticket médio" value={formatBRL(averageTicket)} />
        <StatCard
          label="Estornadas"
          value={report?.voidedCount ?? 0}
          sub="itens devolvidos ao estoque"
        />
      </div>
      <Card>
        <div className="s-card-title">
          Receita por dia <span className="s-dim font-normal">(R$)</span>
        </div>
        <BarChart
          values={days.map((day) => day.revenue)}
          labels={days.map((day) => day.day.slice(8))}
          height={CHART_HEIGHT}
          hl={days.length - 1}
        />
        {days.length === 0 ? (
          <div className="s-dim text-[12.5px]">Sem vendas no período.</div>
        ) : null}
      </Card>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['Data/hora', 'Venda', 'Itens', 'Pagamento', 'NF', 'Total', '']}
          widths="130px 90px 60px 1fr 60px 110px 100px"
          align={[null, null, 'center', null, 'center', 'right', 'right']}
          dense
          emptyText="Nenhuma venda no período"
          rows={sales.map((sale) => ({
            key: sale.id,
            onClick: () => onSaleClick(sale),
            cells: [
              formatDateTime(sale.completedAt ?? sale.cancelledAt),
              `#${saleCode(sale.id)}`,
              itemCount(sale.items),
              sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : '—',
              sale.withInvoice ? 'sim' : 'não',
              <b key="t">{formatBRL(sale.total)}</b>,
              sale.status === SaleStatus.COMPLETED ? (
                // o span impede que o clique no Estornar também abra o detalhe
                <span key="a" onClick={(event) => event.stopPropagation()}>
                  <Button ghost danger onClick={() => onVoidClick(sale)}>
                    Estornar
                  </Button>
                </span>
              ) : (
                <Tag key="a" tone="danger">
                  {SALE_STATUS_LABELS[sale.status].toLowerCase()}
                </Tag>
              ),
            ],
          }))}
        />
      </Card>
      {history ? (
        <div className="flex justify-end">
          <Pager
            page={page}
            total={history.total}
            perPage={history.perPage}
            onChange={onPageChange}
          />
        </div>
      ) : null}
      {detail ? <SaleDetailModal sale={detail} onClose={onDetailClose} /> : null}
      {voiding ? (
        <Modal title={`Estornar venda #${saleCode(voiding.id)}?`} onClose={onVoidClose}>
          <div className="s-dim text-[13.5px] mb-4">
            Os itens voltam ao estoque e o valor é deduzido da receita (BR-05). O histórico é
            preservado para auditoria.
          </div>
          <div className="flex gap-2 justify-end">
            <Button ghost onClick={onVoidClose}>
              Voltar
            </Button>
            <Button danger disabled={isVoiding} onClick={() => onVoidConfirm(voiding)}>
              Estornar venda
            </Button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}
