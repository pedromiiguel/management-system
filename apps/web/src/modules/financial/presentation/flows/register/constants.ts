import { CashMovementType } from '@beverage/shared';
import type { TTagTone } from './types';

export const MOVEMENT_TONES: Record<CashMovementType, TTagTone> = {
  INFLOW: 'ok',
  FLOAT: 'accent',
  PULL: 'warn',
  OUTFLOW: 'warn',
};

/** Entradas e suprimentos somam na gaveta; saídas e sangrias tiram. */
export const ADDS_TO_DRAWER = new Set<CashMovementType>([
  CashMovementType.INFLOW,
  CashMovementType.FLOAT,
]);

export const OPENED_MESSAGE = 'Caixa aberto';
