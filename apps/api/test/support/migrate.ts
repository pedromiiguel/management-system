import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { localResetEnv } from './local-database';

/**
 * Recria o schema do zero aplicando as migrações — uma vez por execução
 * (jest globalSetup), só num Postgres local (`localResetEnv`).
 */
export function migrateFresh() {
  const apiRoot = path.resolve(__dirname, '../..');
  execFileSync(
    process.platform === 'win32' ? 'npx.cmd' : 'npx',
    ['prisma', 'migrate', 'reset', '--force', '--skip-seed', '--skip-generate'],
    {
      cwd: apiRoot,
      stdio: 'inherit',
      shell: process.platform === 'win32',
      env: localResetEnv(),
    },
  );
}
