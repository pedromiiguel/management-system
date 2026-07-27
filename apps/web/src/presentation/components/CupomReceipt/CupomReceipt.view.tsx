import { clsx } from 'clsx';
import type { CupomReceiptViewProps } from './CupomReceipt.types';

export function CupomReceiptView({ text, printOnly }: CupomReceiptViewProps) {
  return <pre className={clsx('s-receipt s-cupom', printOnly && 's-print-only')}>{text}</pre>;
}
