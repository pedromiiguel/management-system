import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';
import {
  ALL_PERMISSIONS,
  DEFAULT_SETTINGS,
  FinancialCategoryKind,
  SETTING_KEYS,
  SystemCategory,
} from '@beverage/shared';
import { ADMIN, SEED_IDS } from './seed-data';

const CATEGORIES: { name: string; kind: FinancialCategoryKind; code?: SystemCategory }[] = [
  { name: 'Vendas', kind: FinancialCategoryKind.INCOME, code: SystemCategory.SALES },
  {
    name: 'Recebimento de fiado',
    kind: FinancialCategoryKind.INCOME,
    code: SystemCategory.RECEIVABLE_SETTLEMENT,
  },
  { name: 'Outras receitas', kind: FinancialCategoryKind.INCOME },
  { name: 'Fornecedores', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Aluguel', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Energia/Água', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Salários', kind: FinancialCategoryKind.EXPENSE },
  { name: 'Outras despesas', kind: FinancialCategoryKind.EXPENSE },
];

/**
 * Dados base de qualquer instalação (inclusive produção). Idempotente: nunca
 * sobrescreve o que já existe.
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
    const existing = await db.financialCategory.findFirst({
      where: c.code ? { OR: [{ code: c.code }, { name: c.name }] } : { name: c.name },
    });
    if (!existing) {
      await db.financialCategory.create({
        data: { name: c.name, kind: c.kind, code: c.code, system: !!c.code },
      });
    }
  }

  for (const key of SETTING_KEYS) {
    await db.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: JSON.stringify(DEFAULT_SETTINGS[key]) },
    });
  }
}
