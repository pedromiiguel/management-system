import { clsx } from 'clsx';
import type { TDreLineProps } from './types';

const LABEL_STYLE = { flex: 1 };

/** Linha do demonstrativo de resultado: operador, rótulo e valor. */
export function DreLine({ op, label, value, isStrong, isResult }: TDreLineProps) {
  return (
    <div className={clsx('s-dre', isStrong && 'is-strong', isResult && 'is-result')}>
      <span className="s-dre-op">{op}</span>
      <span style={LABEL_STYLE}>{label}</span>
      <span className="s-dre-val">{value}</span>
    </div>
  );
}
