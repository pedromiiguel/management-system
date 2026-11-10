import { Prisma } from '@prisma/client';
import { STORE_TIME_ZONE } from '@beverage/shared';

export interface CsvColumn<Row> {
  key: keyof Row & string;
  label: string;
}

/**
 * CSV com BOM (Excel pt-BR) e ponto-e-vírgula. Decimal sai como dinheiro
 * ("1234,50"); número sai como está ("3" ou "12,5"); data no fuso da loja.
 */
export function toCsv<Row extends object>(rows: Row[], columns: CsvColumn<Row>[]): string {
  const escape = (value: unknown): string => {
    if (value === null || value === undefined) return '';
    const s =
      value instanceof Prisma.Decimal
        ? value.toFixed(2).replace('.', ',')
        : typeof value === 'number'
          ? String(value).replace('.', ',')
          : value instanceof Date
            ? value.toLocaleString('pt-BR', { timeZone: STORE_TIME_ZONE })
            : String(value);
    return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = columns.map((c) => escape(c.label)).join(';');
  const body = rows.map((row) => columns.map((c) => escape(row[c.key])).join(';'));
  return '﻿' + [header, ...body].join('\n');
}
