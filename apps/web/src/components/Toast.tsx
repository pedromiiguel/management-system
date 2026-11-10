import { clsx } from 'clsx';
import { useToast } from '@/lib/toast';

export function Toaster() {
  const state = useToast();
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
