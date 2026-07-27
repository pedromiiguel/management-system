import { clsx } from 'clsx';
import type { Sale } from '@/domain/models/sale';
import { buildCupom, STORE } from '@/lib/cupom';

/**
 * Cupom não-fiscal (FR-23) — o mesmo texto que vai para a impressora térmica
 * de 80mm (ver `lib/cupom.ts` e o `@media print` em `styles.css`). Extraído
 * de `ReceiptModal` (sale) para ser reaproveitado por `SaleDetailModal`
 * (reports) — ADR 0009.
 */
export function CupomReceipt({ sale, printOnly }: { sale: Sale; printOnly?: boolean }) {
  return <pre className={clsx('s-receipt s-cupom', printOnly && 's-print-only')}>{buildCupom(sale, STORE)}</pre>;
}
