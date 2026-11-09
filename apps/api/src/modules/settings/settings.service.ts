import { Injectable, Logger } from '@nestjs/common';
import {
  AppSettings,
  DEFAULT_SETTINGS,
  parseSetting,
  SETTING_KEYS,
  SettingKey,
  SettingsInput,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Configurações em runtime (NFR-10). Chaves (`SETTING_KEYS`), validação
 * (`parseSetting`) e defaults (`DEFAULT_SETTINGS`) vêm de @beverage/shared;
 * cada linha do banco é validada na leitura e, se inválida, cai no default.
 * Chave sem linha no banco = default.
 */
@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getAll(): Promise<AppSettings> {
    const rows = await this.prisma.setting.findMany({ where: { key: { in: SETTING_KEYS } } });
    const settings: AppSettings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      const key = row.key as SettingKey;
      const parsed = parseSetting(key, safeJson(row.value));
      if (parsed.success) {
        (settings as Record<SettingKey, unknown>)[key] = parsed.data;
      } else {
        this.logger.warn(`Configuração "${key}" inválida no banco; usando o padrão`);
      }
    }
    return settings;
  }

  async get<K extends SettingKey>(key: K): Promise<AppSettings[K]> {
    return (await this.getAll())[key];
  }

  async update(input: SettingsInput): Promise<AppSettings> {
    const entries = Object.entries(input).filter(([, v]) => v !== undefined);
    await this.prisma.$transaction(
      entries.map(([key, value]) =>
        this.prisma.setting.upsert({
          where: { key },
          update: { value: JSON.stringify(value) },
          create: { key, value: JSON.stringify(value) },
        }),
      ),
    );
    return this.getAll();
  }
}

function safeJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}
