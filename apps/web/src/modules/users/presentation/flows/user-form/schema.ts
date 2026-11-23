import type { z } from 'zod';
import { createUserSchema } from '@beverage/shared';

export const userFormSchema = createUserSchema;
export type TUserFormInput = z.input<typeof userFormSchema>;
