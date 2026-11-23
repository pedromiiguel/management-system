import type { IProduct } from '@modules/products/domain/product-model';

export type TSearchModalProps = {
  initialQuery?: string;
  onPick: (product: IProduct) => void;
  onClose: () => void;
};

export type TSearchModalLayoutProps = {
  search: string;
  results: IProduct[];
  emptyText: string;
  onSearchChange: (search: string) => void;
  onSubmit: () => void;
  onPick: (product: IProduct) => void;
  onClose: () => void;
};
