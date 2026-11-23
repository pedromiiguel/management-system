import type { KeyboardEvent, RefObject } from 'react';
import type { IProduct } from '@modules/products/domain/product-model';

export type TScanBoxProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  /** Enter sem sugestão aberta: bipa o que foi digitado. */
  onSubmit: () => void;
  onPick: (product: IProduct) => void;
};

export type TScanBoxLayoutProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  value: string;
  /** Sugestões visíveis; vazio = lista fechada. */
  suggestions: IProduct[];
  highlighted: number;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  onPick: (product: IProduct) => void;
};
