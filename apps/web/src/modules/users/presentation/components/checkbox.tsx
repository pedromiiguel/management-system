import { clsx } from 'clsx';

type TCheckboxProps = { isOn: boolean; onChange?: (isOn: boolean) => void };

const READ_ONLY_STYLE = { cursor: 'default' };

/** Sem `onChange`, é só leitura. */
export function Checkbox({ isOn, onChange }: TCheckboxProps) {
  return (
    <button
      className={clsx('s-checkbox', isOn && 'is-on')}
      onClick={onChange ? () => onChange(!isOn) : undefined}
      type="button"
      style={onChange ? undefined : READ_ONLY_STYLE}
    >
      {isOn ? '✓' : ''}
    </button>
  );
}
