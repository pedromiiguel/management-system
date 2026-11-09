import { describe, expect, it } from 'vitest';
import { endOfStoreDay, startOfStoreDay, storeCalendarStarts, storeDateKey } from './time';
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
