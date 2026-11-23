import type { z } from 'zod';
import { manualEntrySchema } from '@beverage/shared';
import { moneyText, optionalText } from '@presentation/utils/format';

export const manualEntryFormSchema = manualEntrySchema.extend({
  amount: moneyText(manualEntrySchema.shape.amount),
  categoryId: optionalText,
});

export type TManualEntryFormInput = z.input<typeof manualEntryFormSchema>;
