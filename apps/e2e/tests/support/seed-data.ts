/**
 * Dados que o reset da suíte (`npm run db:reset` → seed base + fixtures)
 * garante existir. Vêm direto do seed da API — os testes não copiam valores.
 */
import { ADMIN as SEED_ADMIN, FIXTURES } from '../../../api/prisma/seed/seed-data';

export const ADMIN = { login: SEED_ADMIN.login, password: SEED_ADMIN.password };

export const CUSTOMER_NAME = FIXTURES.customer.name;

const { skol, brahma, heineken, cocaCola, zeroStock } = FIXTURES.products;

/** `price` = preço de venda, como aparece no PDV. */
export const PRODUCTS = {
  skol: { ...skol, price: skol.salePrice },
  brahma: { ...brahma, price: brahma.salePrice },
  heineken: { ...heineken, price: heineken.salePrice },
  cocaCola: { ...cocaCola, price: cocaCola.salePrice },
  zeroStock: { ...zeroStock, price: zeroStock.salePrice },
};
