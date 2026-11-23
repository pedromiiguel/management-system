import { describe, expect, it } from 'vite-plus/test';
import { closeRegisterMessage, differenceTone } from './utils';

describe('fechamento de caixa', () => {
  it('avisa diferença zero, sobra e falta', () => {
    expect(closeRegisterMessage(0)).toEqual({
      message: 'Caixa fechado — diferença zero ✓',
      tone: 'info',
    });
    expect(closeRegisterMessage(5).message).toMatch(/^Caixa fechado — sobra de R\$\s5,00$/);
    expect(closeRegisterMessage(-2.5)).toMatchObject({ tone: 'warn' });
    expect(closeRegisterMessage(-2.5).message).toMatch(/falta de R\$\s2,50$/);
  });

  it('dá o tom da diferença', () => {
    expect([null, 0, 1, -1].map(differenceTone)).toEqual(['ok', 'ok', 'accent', 'danger']);
  });
});
