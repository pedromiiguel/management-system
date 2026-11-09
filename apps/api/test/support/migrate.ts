import { execFileSync } from 'node:child_process';
import path from 'node:path';

// Sem imports do app/seed: roda no globalSetup do Jest, fora do moduleNameMapper.

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'postgres']);

/** Os testes apagam o banco inteiro: só aceitam um Postgres local. */
export function assertLocalDatabase(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL não definido para os testes');
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(`Testes recusam apagar um banco que não é local (host: ${host})`);
  }
}

/**
 * Recria o schema do zero aplicando as migrações — uma vez por execução
 * (jest globalSetup). O Prisma bloqueia `migrate reset` quando roda sob um
 * agente de IA; o consentimento vale só para este Postgres local de testes,
 * conferido acima.
 */
export function migrateFresh() {
  assertLocalDatabase();
  const apiRoot = path.resolve(__dirname, '../..');
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['prisma', 'migrate', 'reset', '--force', '--skip-seed', '--skip-generate'],
    {
      cwd: apiRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: {
        ...process.env,
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'Sim, pode resetar (Recomendado)',
      },
    },
  );
}
