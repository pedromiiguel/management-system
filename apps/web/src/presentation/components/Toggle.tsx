import { clsx } from 'clsx';

export function Toggle({
  on,
  label,
  ariaLabel,
  onChange,
}: {
  on: boolean;
  label?: string;
  ariaLabel?: string;
  onChange?: (on: boolean) => void;
}) {
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
