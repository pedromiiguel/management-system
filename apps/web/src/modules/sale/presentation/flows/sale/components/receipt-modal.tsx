import { useHotkey } from '@tanstack/react-hotkeys';
import { Button } from '@presentation/components/Button';
import { Modal } from '@presentation/components/Modal';
import type { ISale } from '@modules/sale/domain/sale-model';
import { CupomReceipt } from '../../../components/cupom-receipt/cupom-receipt';

type TReceiptModalProps = { sale: ISale; onClose: () => void };

export function ReceiptModal({ sale, onClose }: TReceiptModalProps) {
  // Enter fecha o cupom e já começa a próxima venda, mesmo com foco num input.
  useHotkey('Enter', onClose, { ignoreInputs: false });

  return (
    <Modal title="Venda concluída ✓" onClose={onClose} width={420}>
      <CupomReceipt sale={sale} />
      <div className="flex gap-2 justify-end mt-4">
        <Button ghost onClick={() => window.print()}>
          Imprimir
        </Button>
        <Button primary onClick={onClose}>
          Nova venda (Enter)
        </Button>
      </div>
    </Modal>
  );
}
