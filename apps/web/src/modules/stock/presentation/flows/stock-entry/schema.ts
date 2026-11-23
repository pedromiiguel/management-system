import type { z } from 'zod';
import { stockEntrySchema } from '@beverage/shared';

export const stockEntryFormSchema = stockEntrySchema.omit({ productId: true });

export type TStockEntryFormInput = z.input<typeof stockEntryFormSchema>;
export type TStockEntryFormOutput = z.output<typeof stockEntryFormSchema>;
