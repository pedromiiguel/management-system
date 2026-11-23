import {
  DiscountType,
  PAYMENT_METHOD_LABELS,
  SALE_STATUS_LABELS,
  saleCode,
  SaleStatus,
  SERVICE_FEE_LABEL,
} from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Modal } from '@presentation/components/Modal';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatBRL, formatDateTime } from '@presentation/utils/format';
import type { ISale } from '@modules/sale/domain/sale-model';
import { salePricing } from '@modules/sale/domain/sale-pricing';
import { CupomReceipt } from '../../components/cupom-receipt/cupom-receipt';

type TSaleDetailModalProps = { sale: ISale; onClose: () => void };

/**
 * Detalhe de uma Venda do histórico (entrada usada pelos Relatórios). Só
 * Venda concluída tem Cupom; estornada ou cancelada é só consulta.
 */
export function SaleDetailModal({ sale, onClose }: TSaleDetailModalProps) {
  const hasCupom = sale.status === SaleStatus.COMPLETED;
  const { discount } = salePricing(sale);
  const discountSuffix =
    sale.discountType === DiscountType.PERCENT ? ` (${sale.discountValue}%)` : '';

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
        rows={sale.items.map((item) => ({
          key: item.id,
          cells: [
            item.product.name,
            item.quantity,
            formatBRL(item.unitPrice),
            formatBRL(item.unitPrice * item.quantity),
          ],
        }))}
      />
      <div className="s-divider" />
      <div className="s-kv">
        <span>Subtotal</span>
        <b>{formatBRL(sale.subtotal)}</b>
      </div>
      {discount > 0 ? (
        <div className="s-kv">
          <span>Desconto{discountSuffix}</span>
          <b>-{formatBRL(discount)}</b>
        </div>
      ) : null}
      {sale.serviceFee ? (
        <div className="s-kv">
          <span>{SERVICE_FEE_LABEL}</span>
          <b>{formatBRL(sale.serviceFee)}</b>
        </div>
      ) : null}
      <div className="s-kv">
        <span>Total</span>
        <b className="text-base">{formatBRL(sale.total)}</b>
      </div>
      <div className="s-kv">
        <span>Pagamento</span>
        <b>{sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : '—'}</b>
      </div>
      {sale.change !== null ? (
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
      ) : null}
      {sale.customer ? (
        <div className="s-kv">
          <span>Cliente</span>
          <b>{sale.customer.name}</b>
        </div>
      ) : null}
      {hasCupom ? <CupomReceipt sale={sale} printOnly /> : null}
      <div className="flex gap-2 justify-end mt-4">
        {hasCupom ? (
          <Button ghost onClick={() => window.print()}>
            Imprimir cupom
          </Button>
        ) : null}
        <Button primary onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Modal>
  );
}
