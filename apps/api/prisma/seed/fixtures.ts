import { PrismaClient } from '@prisma/client';
import { CashRegisterStatus, ReceivableStatus } from '@beverage/shared';
import { StockLedger } from '../../src/modules/stock/stock-ledger';
import { FIXTURES, SEED_IDS } from './seed-data';

/**
 * Dados de exemplo para desenvolvimento e para as suítes de teste (opt-in:
 * `npm run db:seed:fixtures`, ou `db:reset`). Pressupõe o seed base.
 * Idempotente: produto que já existe não recebe nova Entrada.
 */
export async function seedFixtures(db: PrismaClient) {
  const ledger = new StockLedger();

  for (const { stock, ...product } of Object.values(FIXTURES.products)) {
    if (await db.product.findUnique({ where: { sku: product.sku } })) continue;
    await db.$transaction(async (tx) => {
      const created = await tx.product.create({ data: product });
      if (stock > 0) {
        await ledger.entry(tx, {
          productId: created.id,
          quantity: stock,
          note: 'Carga inicial (seed)',
        });
      }
    });
  }

  await db.customer.upsert({
    where: { id: FIXTURES.customer.id },
    update: {},
    create: { ...FIXTURES.customer, active: true },
  });

  if (!(await db.cashRegister.findFirst({ where: { status: CashRegisterStatus.OPEN } }))) {
    await db.cashRegister.create({
      data: { operatorId: SEED_IDS.adminUser, ...FIXTURES.openRegister },
    });
  }

  const openReceivable = await db.accountReceivable.findFirst({
    where: { customerId: FIXTURES.customer.id, status: ReceivableStatus.OPEN },
  });
  if (!openReceivable) {
    await db.accountReceivable.create({
      data: { customerId: FIXTURES.customer.id, ...FIXTURES.openReceivable },
    });
  }
}
