import type { Sale } from '@/domain/models/sale';

export type SaleDetailModalProps = {
  sale: Sale;
  onClose: () => void;
};

export type SaleDetailModalViewProps = {
  sale: Sale;
  cancelled: boolean;
  discount: number;
  paymentLabel: string;
  onPrint: () => void;
  onClose: () => void;
};
