import { clsx } from 'clsx';
import type { ToggleProps } from './Toggle.types';

export function ToggleView({ on, label, ariaLabel, onChange }: ToggleProps) {
  return (
    <button
      className="s-toggle-wrap"
      onClick={() => onChange?.(!on)}
      type="button"
      aria-label={ariaLabel ?? label}
      aria-pressed={on}
    >
      <span className={clsx('s-toggle', on && 'is-on')}>
        <span className="s-knob" />
      </span>
      {label ? <span style={{ fontSize: 13.5 }}>{label}</span> : null}
    </button>
  );
}
