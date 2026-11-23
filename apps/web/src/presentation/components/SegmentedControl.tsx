import { clsx } from 'clsx';

export function SegmentedControl<T extends string>({
  items,
  active,
  onChange,
}: {
  items: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
}) {
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
