import { describe, expect, it } from 'vite-plus/test';
import { toggleItem } from './toggle-item';

describe('toggleItem', () => {
  it('liga no fim e desliga mantendo a ordem', () => {
    expect(toggleItem(['a', 'b'], 'c', true)).toEqual(['a', 'b', 'c']);
    expect(toggleItem(['a', 'b', 'c'], 'b', false)).toEqual(['a', 'c']);
  });
});
