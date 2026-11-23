import type { z } from 'zod';
import { stockAdjustmentSchema } from '@beverage/shared';

export const stockAdjustmentFormSchema = stockAdjustmentSchema.omit({ productId: true });

export type TStockAdjustmentFormInput = z.input<typeof stockAdjustmentFormSchema>;
export type TStockAdjustmentFormOutput = z.output<typeof stockAdjustmentFormSchema>;
