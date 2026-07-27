import { SBtn, SModal, STable, STag } from '@/components/sol';
import { formatBRL, formatDateTime } from '@/lib/format';
import { CupomReceipt } from '@/presentation/components/CupomReceipt';
import type { SaleDetailModalViewProps } from './SaleDetailModal.types';

export function SaleDetailModalView({
  sale,
  cancelled,
  discount,
  paymentLabel,
  onPrint,
  onClose,
}: SaleDetailModalViewProps) {
  return (
    <SModal title={`Venda #${sale.id.slice(-6).toUpperCase()}`} onClose={onClose} width={480}>
      <div className="flex gap-2 items-center mb-2.5">
        {cancelled ? <STag tone="danger">estornada</STag> : <STag tone="accent">concluída</STag>}
        <span className="s-dim text-[12.5px]">
          {formatDateTime(sale.completedAt ?? sale.cancelledAt)} · Operador: {sale.operator.name}
        </span>
      </div>
      <STable
        cols={['Produto', 'Qtd', 'Unit.', 'Total']}
        widths="1fr 50px 90px 90px"
        align={[null, 'center', 'right', 'right']}
        dense
        rows={sale.items.map((i) => ({
          key: i.id,
          cells: [i.product.name, i.quantity, formatBRL(i.unitPrice), formatBRL(i.unitPrice * i.quantity)],
        }))}
      />
      <div className="s-divider" />
      <div className="s-kv"><span>Subtotal</span><b>{formatBRL(sale.subtotal)}</b></div>
      {discount > 0.005 && (
        <div className="s-kv">
          <span>Desconto{sale.discountType === 'PERCENT' ? ` (${sale.discountValue}%)` : ''}</span>
          <b>-{formatBRL(discount)}</b>
        </div>
      )}
      {sale.serviceFee && sale.serviceFee > 0 && (
        <div className="s-kv"><span>Taxa de serviço (10%)</span><b>{formatBRL(sale.serviceFee)}</b></div>
      )}
      <div className="s-kv"><span>Total</span><b className="text-base">{formatBRL(sale.total)}</b></div>
      <div className="s-kv">
        <span>Pagamento</span>
        <b>{paymentLabel}</b>
      </div>
      {sale.change !== null && (
        <>
          <div className="s-kv"><span>Recebido</span><b>{formatBRL(sale.amountPaid)}</b></div>
          <div className="s-kv"><span>Troco</span><b>{formatBRL(sale.change)}</b></div>
        </>
      )}
      {sale.customer && (
        <div className="s-kv"><span>Cliente</span><b>{sale.customer.name}</b></div>
      )}
      {!cancelled && <CupomReceipt sale={sale} printOnly />}
      <div className="flex gap-2 justify-end mt-4">
        {!cancelled && <SBtn ghost onClick={onPrint}>Imprimir cupom</SBtn>}
        <SBtn primary onClick={onClose}>Fechar</SBtn>
      </div>
    </SModal>
  );
}
