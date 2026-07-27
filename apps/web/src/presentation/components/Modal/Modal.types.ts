import type { ReactNode } from 'react';

export type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
};
