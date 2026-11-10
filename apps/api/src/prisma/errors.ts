import { Prisma } from '@prisma/client';

/** Violação de índice único (P2002) — ex.: os índices parciais de caixa aberto e venda em andamento. */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
