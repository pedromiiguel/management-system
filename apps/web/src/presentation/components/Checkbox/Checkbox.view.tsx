import { clsx } from 'clsx';
import type { CheckboxProps } from './Checkbox.types';

export function CheckboxView({ on, onChange }: CheckboxProps) {
  return (
    <button
      className={clsx('s-checkbox', on && 'is-on')}
      onClick={onChange ? () => onChange(!on) : undefined}
      type="button"
      style={onChange ? undefined : { cursor: 'default' }}
    >
      {on ? '✓' : ''}
    </button>
  );
}
