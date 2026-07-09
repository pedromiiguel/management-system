import { createCallable } from 'react-call';
import type { ReactNode } from 'react';
import { SBtn, SModal } from './sol';

interface ConfirmProps {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/** Diálogo de confirmação imperativo — `await Confirm.call({ ... })` resolve `true`/`false`. */
export const Confirm = createCallable<ConfirmProps, boolean>(
  ({ call, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger }) => (
    <SModal title={title} onClose={() => call.end(false)} width={420}>
      <p style={{ fontSize: 13.5, marginBottom: 18 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <SBtn ghost onClick={() => call.end(false)}>{cancelLabel}</SBtn>
        <SBtn danger={danger} primary={!danger} onClick={() => call.end(true)}>
          {confirmLabel}
        </SBtn>
      </div>
    </SModal>
  ),
);
