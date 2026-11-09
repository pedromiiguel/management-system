import { PrismaClient } from '@prisma/client';
import { seedBase } from '../../prisma/seed/base';
import { seedFixtures } from '../../prisma/seed/fixtures';
import { assertLocalDatabase } from './migrate';

/**
 * Volta o banco ao estado "migrações + seed base + fixtures" sem refazer
 * migrações: esvazia as tabelas e roda o mesmo seed do `npm run db:reset`.
 * As categorias do sistema são dados da migração e ficam.
 */
export async function resetData(prisma: PrismaClient) {
  assertLocalDatabase();
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename NOT IN ('_prisma_migrations', 'financial_category')
  `;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
  await prisma.financialCategory.deleteMany({ where: { code: null } });
  await seedBase(prisma);
  await seedFixtures(prisma);
}
