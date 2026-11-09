import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  productSchema,
  roleSchema,
  settingsSchema,
  updateProductSchema,
  updateSettingsSchema,
  updateUserSchema,
} from './schemas';

describe('contrato Zod: defaults só na criação', () => {
  it('PATCH parcial de produto não reativa nem zera estoque mínimo', () => {
    expect(updateProductSchema.parse({ stockEntry: { quantity: 5 } })).toEqual({
      stockEntry: { quantity: 5 },
    });
  });

  it('criação de produto aplica os defaults', () => {
    const parsed = productSchema.parse({
      name: 'X',
      sku: 'X1',
      unit: 'un',
      purchasePrice: 1,
      salePrice: 2,
    });
    expect(parsed.active).toBe(true);
    expect(parsed.minimumStock).toBe(0);
  });

  it('PATCH parcial de usuário não reativa', () => {
    expect(updateUserSchema.parse({ name: 'Novo nome' })).toEqual({ name: 'Novo nome' });
  });

  it('papel só aceita permissões do catálogo', () => {
    expect(roleSchema.safeParse({ name: 'X', permissions: ['sales.operate'] }).success).toBe(true);
    expect(roleSchema.safeParse({ name: 'X', permissions: ['root'] }).success).toBe(false);
  });

  it('configurações: vazio dá os defaults; atualização não injeta defaults', () => {
    expect(settingsSchema.parse({})).toEqual(DEFAULT_SETTINGS);
    expect(updateSettingsSchema.parse({ expiryAlertDays: 10 })).toEqual({ expiryAlertDays: 10 });
    expect(updateSettingsSchema.safeParse({ revenueTargetMonthly: 0 }).success).toBe(false);
  });
});
