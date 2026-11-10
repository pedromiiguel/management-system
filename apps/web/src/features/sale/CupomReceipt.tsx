import { clsx } from 'clsx';
import type { Sale } from './api';
import { buildCupom } from './receipt';

/** O mesmo texto que vai para a impressora (ver `@media print` em styles.css). */
export function CupomReceipt({ sale, printOnly }: { sale: Sale; printOnly?: boolean }) {
  return (
    <pre className={clsx('s-receipt s-cupom', printOnly && 's-print-only')}>{buildCupom(sale)}</pre>
  );
}
