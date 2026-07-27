import { useToastProviderModel } from './Toast.model';
import { ToastView } from './Toast.view';
import type { ToastProviderProps } from './Toast.types';

export function ToastProvider({ children }: ToastProviderProps) {
  const { toast, show, ToastContext } = useToastProviderModel();

  return (
    <ToastContext.Provider value={show}>
      <ToastView toast={toast}>{children}</ToastView>
    </ToastContext.Provider>
  );
}
