import { buildCupom, STORE } from '@/lib/cupom';
import { CupomReceiptView } from './CupomReceipt.view';
import type { CupomReceiptProps } from './CupomReceipt.types';

/**
 * Cupom não-fiscal (FR-23) — o mesmo texto que vai para a impressora térmica
 * de 80mm (ver `lib/cupom.ts` e o `@media print` em `styles.css`). Extraído
 * de `ReceiptModal` (sale) para ser reaproveitado por `SaleDetailModal`
 * (reports) — ADR 0009.
 */
export function CupomReceipt({ sale, printOnly }: CupomReceiptProps) {
  return <CupomReceiptView text={buildCupom(sale, STORE)} printOnly={printOnly} />;
}
