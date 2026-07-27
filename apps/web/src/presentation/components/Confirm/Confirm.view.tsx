import { Button } from '@/presentation/components/Button';
import { Modal } from '@/presentation/components/Modal';
import type { ConfirmViewProps } from './Confirm.types';

export function ConfirmView({
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: ConfirmViewProps) {
  return (
    <Modal title={title} onClose={onCancel} width={420}>
      <p style={{ fontSize: 13.5, marginBottom: 18 }}>{message}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Button ghost onClick={onCancel}>{cancelLabel}</Button>
        <Button danger={danger} primary={!danger} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
