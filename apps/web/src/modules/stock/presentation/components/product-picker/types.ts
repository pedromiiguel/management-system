import type { ReactNode } from 'react';
import type { IProduct } from '@modules/products/domain/product-model';

export type TPickedProduct = Pick<IProduct, 'id' | 'name' | 'currentStock'>;

export type TProductPickerProps = {
  title: string;
  width: number;
  /** Texto da tabela vazia antes de digitar. */
  searchHint: string;
  onClose: () => void;
  children: (product: TPickedProduct, onChangeProduct: () => void) => ReactNode;
};

export type TProductPickerLayoutProps = {
  title: string;
  width: number;
  search: string;
  emptyText: string;
  results: TPickedProduct[];
  /** O formulário do produto escolhido; sem produto, mostra a busca. */
  pickedContent: ReactNode;
  onSearchChange: (search: string) => void;
  onProductClick: (product: TPickedProduct) => void;
  onClose: () => void;
};

export type TPickedProductProps = { product: TPickedProduct };
