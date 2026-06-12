import { Injectable } from '@nestjs/common';
import { PaymentMethod, SettingKey, SettingsInput, StockPolicy } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';

export interface AppSettings {
  stockPolicy: StockPolicy;
  revenueTargetMonthly: number | null;
  enabledPaymentMethods: PaymentMethod[];
  defaultMinimumStock: number;
  expiryAlertDays: number;
}

const DEFAULTS: AppSettings = {
  stockPolicy: StockPolicy.BLOCK,
  revenueTargetMonthly: null,
  enabledPaymentMethods: Object.values(PaymentMethod),
  defaultMinimumStock: 0,
  expiryAlertDays: 30,
};

const KEY_MAP: Record<keyof AppSettings, SettingKey> = {
  stockPolicy: SettingKey.STOCK_POLICY,
  revenueTargetMonthly: SettingKey.REVENUE_TARGET_MONTHLY,
  enabledPaymentMethods: SettingKey.ENABLED_PAYMENT_METHODS,
  defaultMinimumStock: SettingKey.DEFAULT_MINIMUM_STOCK,
  expiryAlertDays: SettingKey.EXPIRY_ALERT_DAYS,
};

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<AppSettings> {
    const rows = await this.prisma.setting.findMany();
    const byKey = new Map(rows.map((r) => [r.key, JSON.parse(r.value) as unknown]));
    const result = { ...DEFAULTS };
    for (const [field, key] of Object.entries(KEY_MAP) as [keyof AppSettings, SettingKey][]) {
      if (byKey.has(key)) (result as Record<string, unknown>)[field] = byKey.get(key);
    }
    return result;
  }

  async get<K extends keyof AppSettings>(field: K): Promise<AppSettings[K]> {
    const row = await this.prisma.setting.findUnique({ where: { key: KEY_MAP[field] } });
    return row ? (JSON.parse(row.value) as AppSettings[K]) : DEFAULTS[field];
  }

  async update(input: SettingsInput): Promise<AppSettings> {
    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    for (const [field, value] of entries) {
      const key = KEY_MAP[field as keyof AppSettings];
      await this.prisma.setting.upsert({
        where: { key },
        update: { value: JSON.stringify(value) },
        create: { key, value: JSON.stringify(value) },
      });
    }
    return this.getAll();
  }
}
