/**
 * Dados que o reset da suíte (`npm run db:reset` → seed base + fixtures)
 * garante existir. Vêm direto do seed da API — os testes não copiam valores.
 */
import { FIXTURES } from '../../../api/prisma/seed/seed-data';

export { ADMIN, FIXTURES } from '../../../api/prisma/seed/seed-data';

export const CUSTOMER_NAME = FIXTURES.customer.name;

export const PRODUCTS = FIXTURES.products;
