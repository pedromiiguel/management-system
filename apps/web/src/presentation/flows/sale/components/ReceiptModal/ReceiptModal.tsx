import { useReceiptModalModel } from './ReceiptModal.model';
import { ReceiptModalView } from './ReceiptModal.view';
import type { ReceiptModalProps } from './ReceiptModal.types';

export function ReceiptModal({ sale, onClose }: ReceiptModalProps) {
  useReceiptModalModel(onClose);

  return <ReceiptModalView sale={sale} onPrint={() => window.print()} onClose={onClose} />;
}
