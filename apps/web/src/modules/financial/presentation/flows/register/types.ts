import type { ICashRegister } from '../../../domain/financial-model';

export type TTagTone = 'ok' | 'accent' | 'warn';

export type TRegisterModal = 'none' | 'open' | 'movement' | 'close';

export type TRegisterLayoutProps = {
  register: ICashRegister | null | undefined;
  history: ICashRegister[];
  modal: TRegisterModal;
  isOpening: boolean;
  isClosing: boolean;
  onOpenClick: () => void;
  onMovementClick: () => void;
  onCloseClick: () => void;
  onOpenSubmit: (openingBalance: number) => void;
  onCloseSubmit: (countedBalance: number) => void;
  onModalClose: () => void;
};

export type TDifferenceProps = { value: number };
