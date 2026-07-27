import type { Sale } from '@/domain/models/sale';

export type CupomReceiptProps = {
  sale: Sale;
  printOnly?: boolean;
};

export type CupomReceiptViewProps = {
  text: string;
  printOnly?: boolean;
};
