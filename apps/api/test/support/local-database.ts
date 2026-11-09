import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { parseEnv } from 'node:util';

// Sem imports do app/seed: roda no globalSetup do Jest e no Playwright (apps/e2e).

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '[::1]', 'postgres']);
const API_DOTENV = path.resolve(__dirname, '../../.env');

/** Os testes apagam o banco inteiro: só aceitam um Postgres local. */
export function assertLocalDatabase(url = process.env.DATABASE_URL) {
  if (!url) throw new Error('DATABASE_URL não definido para os testes');
  const host = new URL(url).hostname;
  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(`Testes recusam apagar um banco que não é local (host: ${host})`);
  }
}

/**
 * Ambiente para resetar o banco dos testes (`prisma migrate reset`): confere
 * que o `DATABASE_URL` efetivo (processo, senão `apps/api/.env`) é local e
 * dá o consentimento que o Prisma exige quando roda sob um agente de IA. O
 * consentimento vale só para esse Postgres local de testes — único lugar
 * onde ele é dado (suíte da API e Playwright).
 */
export function localResetEnv(): NodeJS.ProcessEnv {
  const fromFile = existsSync(API_DOTENV) ? parseEnv(readFileSync(API_DOTENV, 'utf8')) : {};
  assertLocalDatabase(process.env.DATABASE_URL ?? fromFile.DATABASE_URL);
  return {
    ...process.env,
    PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'Sim, pode resetar (Recomendado)',
  };
}
