import { describe, expect, it } from 'vite-plus/test';
import { safeRedirectTarget } from './utils';

describe('safeRedirectTarget', () => {
  it('aceita caminho interno', () => {
    expect(safeRedirectTarget('/stock?x=1')).toBe('/stock?x=1');
  });

  it.each([undefined, '', 'https://evil.com', '//evil.com'])('cai no início com %s', (target) => {
    expect(safeRedirectTarget(target)).toBe('/sale');
  });
});
