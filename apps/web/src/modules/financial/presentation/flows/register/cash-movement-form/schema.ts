import type { z } from 'zod';
import { cashMovementSchema } from '@beverage/shared';
import { moneyText } from '@presentation/utils/format';

export const cashMovementFormSchema = cashMovementSchema.extend({
  amount: moneyText(cashMovementSchema.shape.amount),
});

export type TCashMovementFormInput = z.input<typeof cashMovementFormSchema>;
