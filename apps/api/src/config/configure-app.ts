import { INestApplication } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaExceptionFilter } from '../common/filters/prisma-exception.filter';
import { env } from './env';

/**
 * Tudo o que a aplicação HTTP precisa além dos módulos. Usado por `main.ts` e
 * pelos testes e2e — os testes rodam exatamente a mesma app da produção.
 */
export function configureApp(app: INestApplication): INestApplication {
  serializeDecimalAsNumber();
  app.setGlobalPrefix('api');
  app.enableCors({ origin: env.corsOrigin, credentials: true });
  app.useGlobalFilters(new PrismaExceptionFilter());
  return app;
}

/** Decimal trafega como number no JSON; o cálculo continua em Decimal no servidor. */
function serializeDecimalAsNumber() {
  (Prisma.Decimal.prototype as unknown as { toJSON: () => number }).toJSON = function (
    this: Prisma.Decimal,
  ) {
    return this.toNumber();
  };
}
