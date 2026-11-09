import {
  DiscountType,
  PAYMENT_METHOD_LABELS,
  SALE_STATUS_LABELS,
  saleCode,
  SaleStatus,
  SERVICE_FEE_LABEL,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { formatBRL, formatDateTime } from '@/lib/format';
import type { Sale } from '@/features/sale/api';
import { CupomReceipt } from '@/features/sale/CupomReceipt';
import { salePricing } from '@/features/sale/sale';

/** Só Venda concluída tem Cupom; estornada ou cancelada é só consulta. */
export function SaleDetailModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const hasCupom = sale.status === SaleStatus.COMPLETED;
  const { discount } = salePricing(sale);

  return (
    <Modal title={`Venda #${saleCode(sale.id)}`} onClose={onClose} width={480}>
      <div className="flex gap-2 items-center mb-2.5">
        <Tag tone={hasCupom ? 'accent' : 'danger'}>
          {SALE_STATUS_LABELS[sale.status].toLowerCase()}
        </Tag>
        <span className="s-dim text-[12.5px]">
          {formatDateTime(sale.completedAt ?? sale.cancelledAt)} · Operador: {sale.operator.name}
        </span>
      </div>
      <Table
        cols={['Produto', 'Qtd', 'Unit.', 'Total']}
        widths="1fr 50px 90px 90px"
        align={[null, 'center', 'right', 'right']}
        dense
        rows={sale.items.map((i) => ({
          key: i.id,
          cells: [
            i.product.name,
            i.quantity,
            formatBRL(i.unitPrice),
            formatBRL(i.unitPrice * i.quantity),
          ],
        }))}
      />
      <div className="s-divider" />
      <div className="s-kv">
        <span>Subtotal</span>
        <b>{formatBRL(sale.subtotal)}</b>
      </div>
      {discount > 0 && (
        <div className="s-kv">
          <span>
            Desconto
            {sale.discountType === DiscountType.PERCENT ? ` (${sale.discountValue}%)` : ''}
          </span>
          <b>-{formatBRL(discount)}</b>
        </div>
      )}
      {!!sale.serviceFee && (
        <div className="s-kv">
          <span>{SERVICE_FEE_LABEL}</span>
          <b>{formatBRL(sale.serviceFee)}</b>
        </div>
      )}
      <div className="s-kv">
        <span>Total</span>
        <b className="text-base">{formatBRL(sale.total)}</b>
      </div>
      <div className="s-kv">
        <span>Pagamento</span>
        <b>{sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : '—'}</b>
      </div>
      {sale.change !== null && (
        <>
          <div className="s-kv">
            <span>Recebido</span>
            <b>{formatBRL(sale.amountPaid)}</b>
          </div>
          <div className="s-kv">
            <span>Troco</span>
            <b>{formatBRL(sale.change)}</b>
          </div>
        </>
      )}
      {sale.customer && (
        <div className="s-kv">
          <span>Cliente</span>
          <b>{sale.customer.name}</b>
        </div>
      )}
      {hasCupom && <CupomReceipt sale={sale} printOnly />}
      <div className="flex gap-2 justify-end mt-4">
        {hasCupom && (
          <Button ghost onClick={() => window.print()}>
            Imprimir cupom
          </Button>
        )}
        <Button primary onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
