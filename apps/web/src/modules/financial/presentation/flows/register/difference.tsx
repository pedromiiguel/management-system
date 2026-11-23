import { formatBRL } from '@presentation/utils/format';
import type { TDifferenceProps } from './types';

const OK_CLASS = 'text-[color:var(--ok)]';
const DANGER_CLASS = 'text-[color:var(--danger)]';

export function Difference({ value }: TDifferenceProps) {
  const className = value === 0 ? OK_CLASS : value < 0 ? DANGER_CLASS : undefined;
  return (
    <div className="s-kv is-troco mt-2">
      <span>Diferença</span>
      <b className={className}>{formatBRL(value)}</b>
    </div>
  );
}
