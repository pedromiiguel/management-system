import { z } from 'zod';
import { updateSettingsSchema } from '@beverage/shared';
import { moneyText } from '@presentation/utils/format';

/** Meta é opcional: campo vazio remove a meta (null); senão vale a regra do shared (> 0). */
export const targetTextSchema = z
  .string()
  .trim()
  .pipe(
    z.union([
      z.literal('').transform(() => null),
      moneyText(updateSettingsSchema.shape.revenueTargetMonthly.unwrap().unwrap()),
    ]),
  );
