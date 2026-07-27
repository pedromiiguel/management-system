import { PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { SaleDetailModalView } from './SaleDetailModal.view';
import type { SaleDetailModalProps } from './SaleDetailModal.types';

// Detalhe de uma venda do histórico: itens, totais e reimpressão do cupom
// (só para vendas concluídas — estornada é consulta, não gera cupom).
export function SaleDetailModal({ sale, onClose }: SaleDetailModalProps) {
  const cancelled = sale.status === 'CANCELLED';
  const serviceFee = sale.serviceFee ?? 0;
  const discount = sale.subtotal - (sale.total - serviceFee);
  const paymentLabel = sale.paymentMethod ? PAYMENT_METHOD_LABELS[sale.paymentMethod] : '—';

  return (
    <SaleDetailModalView
      sale={sale}
      cancelled={cancelled}
      discount={discount}
      paymentLabel={paymentLabel}
      onPrint={() => window.print()}
      onClose={onClose}
    />
  );
}
