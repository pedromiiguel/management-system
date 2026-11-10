import { describe, expect, it } from 'vitest';
import {
  addDaysToKey,
  dateOnlyKey,
  daysBetweenKeys,
  endOfStoreDay,
  startOfStoreDay,
  storeCalendarStarts,
  storeDateKey,
  storeMonthKeys,
} from './time';
import { periodQuerySchema } from './schemas';

describe('dia civil da loja (America/Sao_Paulo, UTC−3)', () => {
  it('começa às 03:00 UTC e termina às 02:59:59.999 UTC do dia seguinte', () => {
    expect(startOfStoreDay('2026-11-09').toISOString()).toBe('2026-11-09T03:00:00.000Z');
    expect(endOfStoreDay('2026-11-09').toISOString()).toBe('2026-11-10T02:59:59.999Z');
  });

  it('um instante depois das 21h locais ainda é o mesmo dia da loja', () => {
    expect(storeDateKey(new Date('2026-11-10T01:30:00Z'))).toBe('2026-11-09');
  });

  it('início de dia, mês e ano no fuso da loja', () => {
    const starts = storeCalendarStarts(new Date('2026-01-01T02:00:00Z'));
    // 2026-01-01 02:00Z ainda é 31/12/2025 na loja
    expect(starts.day.toISOString()).toBe('2025-12-31T03:00:00.000Z');
    expect(starts.month.toISOString()).toBe('2025-12-01T03:00:00.000Z');
    expect(starts.year.toISOString()).toBe('2025-01-01T03:00:00.000Z');
  });

  it('periodQuerySchema trata AAAA-MM-DD como dias da loja e ISO como instantes', () => {
    const days = periodQuerySchema.parse({ from: '2026-11-01', to: '2026-11-09' });
    expect(days.from.toISOString()).toBe('2026-11-01T03:00:00.000Z');
    expect(days.to.toISOString()).toBe('2026-11-10T02:59:59.999Z');

    const instants = periodQuerySchema.parse({
      from: '2026-11-01T10:00:00.000Z',
      to: '2026-11-01T11:00:00.000Z',
    });
    expect(instants.from.toISOString()).toBe('2026-11-01T10:00:00.000Z');
    expect(periodQuerySchema.safeParse({ from: 'ontem', to: '2026-11-01' }).success).toBe(false);
  });
});

describe('datas sem hora e chaves AAAA-MM-DD', () => {
  it('lê o dia gravado (meia-noite UTC) sem deslocar pelo fuso', () => {
    expect(dateOnlyKey('2026-11-09T00:00:00.000Z')).toBe('2026-11-09');
    expect(dateOnlyKey(new Date('2026-11-09'))).toBe('2026-11-09');
  });

  it('soma e conta dias civis, atravessando mês e ano', () => {
    expect(addDaysToKey('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDaysToKey('2025-12-31', 1)).toBe('2026-01-01');
    expect(daysBetweenKeys('2026-11-09', '2026-11-12')).toBe(3);
    expect(daysBetweenKeys('2026-11-09', '2026-11-01')).toBe(-8);
  });

  it('últimos meses da loja terminam no mês corrente do fuso da loja', () => {
    // 2026-03-01 01:00Z ainda é fevereiro na loja
    expect(storeMonthKeys(new Date('2026-03-01T01:00:00Z'), 3)).toEqual([
      '2025-12',
      '2026-01',
      '2026-02',
    ]);
  });
});
