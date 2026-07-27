import { SBars, SBtn, SCard, SModal, SStat, STable } from '@/components/sol';
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
        <SStat label="Receita no período" value={revenue} sub="produtos, líquida de taxa de serviço" />
        <SStat label="Taxa de serviço" value={serviceFeeTotal} sub="10% — fica com a casa" />
        <SStat label="Nº de vendas" value={count} />
        <SStat label="Ticket médio" value={ticket} />
        <SStat label="Canceladas" value={cancelled} sub="estoque estornado automaticamente" />
      </div>
      <SCard>
        <div className="s-card-title">
          Receita por dia <span className="s-dim font-normal">(R$)</span>
        </div>
        <SBars values={dayValues} labels={dayLabels} height={110} hl={dayValues.length - 1} />
        {dayValues.length === 0 && <div className="s-dim text-[12.5px]">Sem vendas no período.</div>}
      </SCard>
      <SCard pad={8} className="flex-1 min-h-0 overflow-auto">
        <STable
          cols={['Data/hora', 'Venda', 'Itens', 'Pagamento', 'NF', 'Total', '']}
          widths="130px 90px 60px 1fr 60px 110px 100px"
          align={[null, null, 'center', null, 'center', 'right', 'right']}
          dense
          emptyText="Nenhuma venda no período"
          rows={rows}
        />
      </SCard>
      {detail && <SaleDetailModal sale={detail} onClose={onCloseDetail} />}
      {voiding && (
        <SModal title={`Estornar venda #${voiding.id.slice(-6).toUpperCase()}?`} onClose={onCancelVoid}>
          <div className="s-dim text-[13.5px] mb-4">
            Os itens voltam ao estoque e o valor é deduzido da receita (BR-05). O histórico é
            preservado para auditoria.
          </div>
          <div className="flex gap-2 justify-end">
            <SBtn ghost onClick={onCancelVoid}>Voltar</SBtn>
            <SBtn danger disabled={isVoiding} onClick={onConfirmVoid}>
              Estornar venda
            </SBtn>
          </div>
        </SModal>
      )}
    </>
  );
}
