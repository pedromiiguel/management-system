import type { z } from 'zod';
import { payableSchema } from '@beverage/shared';
import { moneyText, optionalText } from '@presentation/utils/format';

export const payableFormSchema = payableSchema.extend({
  amount: moneyText(payableSchema.shape.amount),
  supplier: optionalText,
  categoryId: optionalText,
});

export type TPayableFormInput = z.input<typeof payableFormSchema>;
