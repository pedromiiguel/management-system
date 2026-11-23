import { CashMovementType } from '@beverage/shared';

export const MOVEMENT_TYPES = [
  CashMovementType.PULL,
  CashMovementType.FLOAT,
  CashMovementType.OUTFLOW,
] as const;

export const PULL_PLACEHOLDER = 'ex.: depósito no banco';
export const OTHER_PLACEHOLDER = 'ex.: reforço de troco';
export const PULL_SAVED_MESSAGE = 'Sangria registrada';
export const OTHER_SAVED_MESSAGE = 'Movimento registrado';
