import { clsx } from 'clsx';
import type { DreLineProps } from './DreLine.types';

export function DreLineView({ op, label, value, strong, accent }: DreLineProps) {
  return (
    <div className={clsx('s-dre', strong && 'is-strong', accent && 'is-result')}>
      <span className="s-dre-op">{op}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span className="s-dre-val">{value}</span>
    </div>
  );
}
