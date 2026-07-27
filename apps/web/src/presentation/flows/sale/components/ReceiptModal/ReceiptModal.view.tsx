import { Button } from '@/presentation/components/Button';
import { Modal } from '@/presentation/components/Modal';
import { CupomReceipt } from '@/presentation/components/CupomReceipt';
import type { ReceiptModalViewProps } from './ReceiptModal.types';

export function ReceiptModalView({ sale, onPrint, onClose }: ReceiptModalViewProps) {
  return (
    <Modal title="Venda concluída ✓" onClose={onClose} width={420}>
      <CupomReceipt sale={sale} />
      <div className="flex gap-2 justify-end mt-4">
        <Button ghost onClick={onPrint}>
          Imprimir
        </Button>
        <Button primary onClick={onClose}>
          Nova venda (Enter)
        </Button>
      </div>
    </Modal>
  );
}
