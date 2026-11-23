import type { TQtyStepperLayoutProps } from './types';

export function QtyStepperLayout({
  raw,
  canDecrease,
  onStep,
  onRawChange,
  onCommit,
}: TQtyStepperLayoutProps) {
  return (
    <div className="s-qty-stepper" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        disabled={!canDecrease}
        onClick={() => onStep(-1)}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <input
        value={raw}
        inputMode="numeric"
        aria-label="Quantidade"
        onChange={(event) => onRawChange(event.target.value)}
        onBlur={onCommit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <button type="button" onClick={() => onStep(1)} aria-label="Aumentar quantidade">
        +
      </button>
    </div>
  );
}
