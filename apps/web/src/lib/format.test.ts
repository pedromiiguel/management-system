import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  formatDateOnly,
  formatDateTime,
  maskBRL,
  monthToDate,
  moneyText,
  parseMoney,
} from './format';

describe('parseMoney', () => {
  it.each([
    ['12,50', 12.5],
    ['12.50', 12.5],
    ['R$ 1.234,56', 1234.56],
    ['1.234', 1234],
    ['  7 ', 7],
    ['0,005', 0.01],
    ['', 0],
  ])('%j → %d', (raw, expected) => {
    expect(parseMoney(raw)).toBe(expected);
  });

  it('returns NaN for text that is not a number', () => {
    expect(parseMoney('abc')).toBeNaN();
    expect(parseMoney('12,5,0')).toBeNaN();
  });
});

describe('maskBRL', () => {
  it('formats typed digits as cents', () => {
    expect(maskBRL('1250')).toBe('12,50');
    expect(maskBRL('123456')).toBe('1.234,56');
    expect(maskBRL('R$ 9')).toBe('0,09');
    expect(maskBRL('')).toBe('');
  });
});

describe('moneyText', () => {
  const amount = moneyText(z.number().positive('Informe um valor'));

  it('parses the text and applies the numeric rule', () => {
    expect(amount.parse('1.000,25')).toBe(1000.25);
    expect(amount.safeParse('0').success).toBe(false);
    expect(amount.safeParse('x').success).toBe(false);
  });
});

describe('datas (regra do dia da loja)', () => {
  it('data sem hora não desloca pelo fuso', () => {
    expect(formatDateOnly('2026-11-09T00:00:00.000Z')).toBe('09/11/2026');
  });

  it('instante é mostrado no fuso da loja', () => {
    expect(formatDateTime('2026-11-10T01:30:00Z')).toBe('09/11, 22:30');
  });

  it('mês até hoje parte do dia 1º', () => {
    expect(monthToDate('2026-11-09')).toEqual({ from: '2026-11-01', to: '2026-11-09' });
  });
});
