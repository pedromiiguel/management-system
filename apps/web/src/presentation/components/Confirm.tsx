import type { ReactNode } from 'react';
import { createCallable } from 'react-call';
import { Button } from './Button';
import { Modal } from './Modal';

/** Confirmação imperativa: `await Confirm.call({ ... })` resolve `true`/`false`. */
export const Confirm = createCallable<
  {
    title: string;
    message: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    danger?: boolean;
  },
  boolean
>(({ call, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger }) => (
  <Modal title={title} onClose={() => call.end(false)} width={420}>
    <p style={{ fontSize: 13.5, marginBottom: 18 }}>{message}</p>
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Button ghost onClick={() => call.end(false)}>
        {cancelLabel}
      </Button>
      <Button danger={danger} primary={!danger} onClick={() => call.end(true)}>
        {confirmLabel}
      </Button>
    </div>
  </Modal>
));
