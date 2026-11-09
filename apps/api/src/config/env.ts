import { existsSync } from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

const DEV_JWT_SECRET = 'dev-secret-nao-use-em-producao';

const required = (name: string) =>
  z.string({ error: `${name} é obrigatório` }).min(1, `${name} é obrigatório`);

const envSchema = (production: boolean) =>
  z
    .object({
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
      DATABASE_URL: required('DATABASE_URL'),
      /** Obrigatório em produção; fora dela cai num segredo de desenvolvimento. */
      JWT_SECRET: production ? required('JWT_SECRET (em produção)') : z.string().optional(),
      JWT_EXPIRES_IN: z
        .string()
        .regex(/^\d+[smhd]?$/, 'Use, por ex., 12h ou 3600')
        .default('12h'),
      PORT: z.coerce.number().int().positive().default(3000),
      /**
       * Origens separadas por vírgula. Obrigatório em produção; fora dela,
       * vazio = reflete qualquer origem.
       */
      CORS_ORIGIN: production
        ? required('CORS_ORIGIN (em produção)').refine(
            (v) => v.split(',').some((o) => o.trim()),
            'CORS_ORIGIN (em produção) precisa de ao menos uma origem',
          )
        : z.string().optional(),
      OBSERVE_APP_KEY: z.string().optional(),
      OBSERVE_APP_SECRET: z.string().optional(),
    })
    .transform((env) => {
      const origins = (env.CORS_ORIGIN ?? '')
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean);
      return {
        nodeEnv: env.NODE_ENV,
        port: env.PORT,
        jwt: {
          secret: env.JWT_SECRET || DEV_JWT_SECRET,
          expiresIn: env.JWT_EXPIRES_IN as `${number}${'s' | 'm' | 'h' | 'd' | ''}`,
        },
        corsOrigin: origins.length > 0 ? origins : (true as const),
        observe:
          env.OBSERVE_APP_KEY && env.OBSERVE_APP_SECRET
            ? { appKey: env.OBSERVE_APP_KEY, appSecret: env.OBSERVE_APP_SECRET }
            : null,
      };
    });

export type Env = z.output<ReturnType<typeof envSchema>>;

/**
 * Lê e valida o ambiente uma única vez. Fora de produção carrega
 * `apps/api/.env` (variáveis já definidas no processo têm prioridade).
 * Falha na subida, com a lista do que falta, em vez de cair em defaults
 * silenciosos.
 */
function loadEnv(): Env {
  const dotenv = path.resolve(__dirname, '../../.env');
  if (process.env.NODE_ENV !== 'production' && existsSync(dotenv)) {
    process.loadEnvFile(dotenv);
  }
  const production = process.env.NODE_ENV === 'production';
  const parsed = envSchema(production).safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`);
    throw new Error(`Configuração de ambiente inválida:\n${issues.join('\n')}`);
  }
  return parsed.data;
}

export const env = loadEnv();
