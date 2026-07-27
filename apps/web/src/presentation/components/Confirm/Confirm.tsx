import { createCallable } from 'react-call';
import { ConfirmView } from './Confirm.view';
import type { ConfirmProps } from './Confirm.types';

/** Diálogo de confirmação imperativo — `await Confirm.call({ ... })` resolve `true`/`false`. */
export const Confirm = createCallable<ConfirmProps, boolean>(
  ({ call, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger }) => (
    <ConfirmView
      title={title}
      message={message}
      confirmLabel={confirmLabel}
      cancelLabel={cancelLabel}
      danger={danger}
      onConfirm={() => call.end(true)}
      onCancel={() => call.end(false)}
    />
  ),
);
