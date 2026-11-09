import { PrismaClient } from '@prisma/client';
import { seedBase } from '../../prisma/seed/base';
import { seedFixtures } from '../../prisma/seed/fixtures';
import { assertLocalDatabase } from './migrate';

/**
 * Volta o banco ao estado "seed base + fixtures" sem refazer migrações:
 * esvazia todas as tabelas e roda o mesmo seed do `npm run db:reset`.
 */
export async function resetData(prisma: PrismaClient) {
  assertLocalDatabase();
  const tables = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  const list = tables.map((t) => `"public"."${t.tablename}"`).join(', ');
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`);
  await seedBase(prisma);
  await seedFixtures(prisma);
}
