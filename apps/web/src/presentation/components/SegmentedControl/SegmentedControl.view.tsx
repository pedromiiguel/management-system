import { clsx } from 'clsx';
import type { SegmentedControlProps } from './SegmentedControl.types';

export function SegmentedControlView<T extends string>({ items, active, onChange }: SegmentedControlProps<T>) {
  return (
    <div className="s-seg">
      {items.map((item) => (
        <button
          key={item.id}
          className={clsx('s-seg-item', item.id === active && 'is-active')}
          onClick={() => onChange(item.id)}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
