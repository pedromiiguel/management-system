import { existsSync } from 'node:fs';
import path from 'node:path';
import { migrateFresh } from './migrate';

export default function globalSetup() {
  // Mesmo .env que a app carrega (src/config/env.ts); o ambiente tem prioridade.
  const dotenv = path.resolve(__dirname, '../../.env');
  if (existsSync(dotenv)) process.loadEnvFile(dotenv);
  migrateFresh();
}
