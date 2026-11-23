import { clsx } from 'clsx';
import type { ISale } from '@modules/sale/domain/sale-model';
import { buildCupom } from './build-cupom';

type TCupomReceiptProps = { sale: ISale; printOnly?: boolean };

/** O mesmo texto que vai para a impressora (ver `@media print` em styles.css). */
export function CupomReceipt({ sale, printOnly }: TCupomReceiptProps) {
  return (
    <pre className={clsx('s-receipt s-cupom', printOnly && 's-print-only')}>{buildCupom(sale)}</pre>
  );
}
