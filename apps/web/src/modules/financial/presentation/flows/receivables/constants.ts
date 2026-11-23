import { PaymentMethod, type SettleReceivableInput } from '@beverage/shared';

export const SETTLE_METHODS: SettleReceivableInput['paymentMethod'][] = [
  PaymentMethod.CASH,
  PaymentMethod.PIX,
  PaymentMethod.CARD,
];
export const SETTLED_MESSAGE = 'Recebimento registrado';
