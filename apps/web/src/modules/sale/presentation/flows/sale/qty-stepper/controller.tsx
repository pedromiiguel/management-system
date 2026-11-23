import { useState } from 'react';
import { QtyStepperLayout } from './layout';
import type { TQtyStepperProps } from './types';

/**
 * Alterar quantidade (FR-14): +/- ou digitação direta. Mantém um texto
 * próprio enquanto se digita (só dígitos) e volta ao valor externo quando
 * ele muda.
 */
export function QtyStepperController({ quantity, onStep, onTyped, onDone }: TQtyStepperProps) {
  const [draftState, setDraftState] = useState<{ base: number; raw: string } | null>(null);
  const raw = draftState && draftState.base === quantity ? draftState.raw : String(quantity);

  function handleCommit() {
    const parsed = Number(raw);
    if (Number.isInteger(parsed) && parsed > 0) onTyped(parsed);
    setDraftState(null);
    onDone();
  }

  return (
    <QtyStepperLayout
      raw={raw}
      canDecrease={quantity > 1}
      onStep={onStep}
      onRawChange={(next) => setDraftState({ base: quantity, raw: next.replace(/\D/g, '') })}
      onCommit={handleCommit}
    />
  );
}
