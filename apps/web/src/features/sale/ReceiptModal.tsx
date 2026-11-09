import { useHotkey } from '@tanstack/react-hotkeys';
import { Button } from '@/components/Button';
import { Modal } from '@/components/Modal';
import type { Sale } from './api';
import { CupomReceipt } from './CupomReceipt';

export function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
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
