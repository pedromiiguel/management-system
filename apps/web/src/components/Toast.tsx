import { clsx } from 'clsx';
import { useSyncExternalStore } from 'react';

type Tone = 'info' | 'warn' | 'danger';
type ToastState = { message: string; tone: Tone } | null;

const DURATION_MS = 3500;

let current: ToastState = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit(next: ToastState) {
  current = next;
  listeners.forEach((listener) => listener());
}

/** Mostra um aviso por alguns segundos; um novo substitui o anterior. */
export function toast(message: string, tone: Tone = 'info') {
  clearTimeout(timer);
  emit({ message, tone });
  timer = setTimeout(() => emit(null), DURATION_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function Toaster() {
  const state = useSyncExternalStore(subscribe, () => current);
  if (!state) return null;
  return (
    <div
      className={clsx(
        's-toast',
        state.tone === 'warn' && 'is-warn',
        state.tone === 'danger' && 'is-danger',
      )}
    >
      {state.message}
    </div>
  );
}
