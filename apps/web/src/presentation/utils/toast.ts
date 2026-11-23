import { useSyncExternalStore } from 'react';

export type ToastTone = 'info' | 'warn' | 'danger';
export type ToastState = { message: string; tone: ToastTone } | null;

const DURATION_MS = 3500;

let current: ToastState = null;
let timer: ReturnType<typeof setTimeout> | undefined;
const listeners = new Set<() => void>();

function emit(next: ToastState) {
  current = next;
  listeners.forEach((listener) => listener());
}

/** Mostra um aviso por alguns segundos; um novo substitui o anterior. */
export function toast(message: string, tone: ToastTone = 'info') {
  clearTimeout(timer);
  emit({ message, tone });
  timer = setTimeout(() => emit(null), DURATION_MS);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** O aviso atual — quem desenha é `components/Toast`. */
export function useToast(): ToastState {
  return useSyncExternalStore(subscribe, () => current);
}
