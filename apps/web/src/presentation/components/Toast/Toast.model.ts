import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { ToastState, ToastTone } from './Toast.types';

const ToastContext = createContext<(message: string, tone?: ToastTone) => void>(() => {});

/** Dispara um toast — `const toast = useToast(); toast('Salvo!', 'info')`. */
export function useToast() {
  return useContext(ToastContext);
}

export function useToastProviderModel() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, tone: ToastTone = 'info') => {
    setToast({ message, tone });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  return { toast, show, ToastContext };
}
