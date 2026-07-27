import { SBtn, SModal } from '@/components/sol';
import { CupomReceipt } from '@/presentation/components/CupomReceipt';
import type { ReceiptModalViewProps } from './ReceiptModal.types';

export function ReceiptModalView({ sale, onPrint, onClose }: ReceiptModalViewProps) {
  return (
    <SModal title="Venda concluída ✓" onClose={onClose} width={420}>
      <CupomReceipt sale={sale} />
      <div className="flex gap-2 justify-end mt-4">
        <SBtn ghost onClick={onPrint}>
          Imprimir
        </SBtn>
        <SBtn primary onClick={onClose}>
          Nova venda (Enter)
        </SBtn>
      </div>
    </SModal>
  );
}
