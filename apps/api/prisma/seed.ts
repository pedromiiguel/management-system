import { PrismaClient } from '@prisma/client';
import { seedBase } from './seed/base';
import { seedFixtures } from './seed/fixtures';
import { ADMIN } from './seed/seed-data';

/**
 * `prisma db seed` → só os dados base (papel/admin e categorias sugeridas).
 * `prisma db seed -- --fixtures` → também os dados de exemplo/teste.
 */
async function main() {
  const prisma = new PrismaClient();
  try {
    await seedBase(prisma);
    const withFixtures = process.argv.includes('--fixtures');
    if (withFixtures) await seedFixtures(prisma);
    console.log(
      `Seed concluído${withFixtures ? ' (com dados de exemplo)' : ''}. Login: ${ADMIN.login}`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
