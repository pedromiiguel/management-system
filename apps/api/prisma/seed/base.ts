import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import { ALL_PERMISSIONS, FinancialCategoryKind } from '@beverage/shared';
import { ADMIN, SEED_IDS } from './seed-data';

/**
 * Categorias sugeridas, editáveis pelo usuário. As categorias do sistema
 * (Vendas, Recebimento de fiado — `SystemCategory`) vêm da migração
 * 20261109120100, não daqui: o banco nunca fica sem elas, com ou sem seed.
 */
const CATEGORIES: { name: string; kind: FinancialCategoryKind }[] = [
  { name: 'Outras receitas', kind: FinancialCategoryKind.INCOME },
  { name: 'Fornecedores', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Aluguel', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Energia/Água', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Salários', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Outras despesas', kind: FinancialCategoryKind.EXPENSE },
];

/**
 * Dados base de qualquer instalação (inclusive produção). Idempotente: nunca
 * sobrescreve o que já existe. Configurações não são semeadas: sem linha no
 * banco, `SettingsService` usa `DEFAULT_SETTINGS`.
 */
export async function seedBase(db: PrismaClient) {
  // O papel de sistema recebe o catálogo inteiro em runtime; a lista gravada é só informativa.
  const adminRole = await db.role.upsert({
    where: { name: 'Administrador' },
    update: {},
    create: {
      id: SEED_IDS.adminRole,
      name: 'Administrador',
      permissions: ALL_PERMISSIONS,
      system: true,
    },
  });

  await db.user.upsert({
    where: { login: ADMIN.login },
    update: {},
    create: {
      id: SEED_IDS.adminUser,
      name: 'Administrador',
      login: ADMIN.login,
      passwordHash: await argon2.hash(ADMIN.password),
      roleId: adminRole.id,
    },
  });

  for (const c of CATEGORIES) {
    const existing = await db.financialCategory.findFirst({ where: { name: c.name } });
    if (!existing) await db.financialCategory.create({ data: c });
  }
}
