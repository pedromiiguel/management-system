import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { localResetEnv } from '../../../api/test/support/local-database';

const repoRoot = path.resolve(__dirname, '../../../..');
const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

/**
 * Reset de schema + seed determinístico (base + fixtures). Chamado uma vez por
 * arquivo de teste (test.beforeAll) — nunca por teste individual, porque o
 * domínio é acumulativo (estoque, caixa, fiado) e cada arquivo precisa partir
 * de um estado conhecido. Ver "Testes" em docs/arquitetura.md.
 *
 * Roda o `db:reset` da raiz, que compila o shared antes do seed — o seed usa
 * o `dist/` do shared e nunca roda com um shared desatualizado. A guarda de
 * banco local e o consentimento do Prisma são os mesmos da suíte da API.
 */
export function resetDatabase(): void {
  execFileSync(npmCmd, ['run', 'db:reset'], {
    cwd: repoRoot,
    stdio: 'inherit',
    // No Windows, .cmd precisa passar pelo shell — sem isso o spawn falha com EINVAL.
    shell: process.platform === 'win32',
    env: localResetEnv(),
  });
}
