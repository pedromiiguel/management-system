import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { endOfDay, maskBRL, moneyText, parseMoney } from './format';

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

it('endOfDay appends the last second of the day', () => {
  expect(endOfDay('2026-01-31')).toBe('2026-01-31T23:59:59');
});
