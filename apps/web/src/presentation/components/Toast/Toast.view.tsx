import { clsx } from 'clsx';
import type { ToastViewProps } from './Toast.types';

export function ToastView({ children, toast }: ToastViewProps) {
  return (
    <>
      {children}
      {toast && (
        <div className={clsx('s-toast', toast.tone === 'warn' && 'is-warn', toast.tone === 'danger' && 'is-danger')}>
          {toast.message}
        </div>
      )}
    </>
  );
}
