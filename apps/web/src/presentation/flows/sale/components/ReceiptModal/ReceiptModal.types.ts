import type { Sale } from '@/domain/models/sale';

export type ReceiptModalProps = {
  sale: Sale;
  onClose: () => void;
};

export type ReceiptModalViewProps = {
  sale: Sale;
  onPrint: () => void;
  onClose: () => void;
};
