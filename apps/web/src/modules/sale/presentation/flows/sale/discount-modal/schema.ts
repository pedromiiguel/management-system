import { z } from 'zod';
import { discountSchema } from '@beverage/shared';
import { parseMoney } from '@presentation/utils/format';

// O valor é digitado como texto ("12,50"); as regras são as do shared.
export const discountFormSchema = z
  .object({ type: discountSchema.shape.type, raw: z.string() })
  .transform(({ type, raw }) => ({ type, value: parseMoney(raw) }))
  .pipe(discountSchema);

export type TDiscountFormValues = z.input<typeof discountFormSchema>;
