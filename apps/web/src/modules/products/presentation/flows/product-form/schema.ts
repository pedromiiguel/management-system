import type { z } from 'zod';
import { productSchema, productStockEntrySchema, type ProductInput } from '@beverage/shared';

// Entrada embutida (CONTEXT.md, Entrada): opcional — só vira movimento de estoque se a
// quantidade for preenchida. O custo é o preço de compra do próprio formulário.
export const productFormSchema = productSchema
  .extend({ stockEntry: productStockEntrySchema.partial().optional() })
  .transform(({ stockEntry, ...product }): ProductInput => ({
    ...product,
    ...(stockEntry?.quantity
      ? {
          stockEntry: {
            quantity: stockEntry.quantity,
            batch: stockEntry.batch,
            expiresAt: stockEntry.expiresAt,
          },
        }
      : {}),
  }));

export type TProductFormInput = z.input<typeof productFormSchema>;
