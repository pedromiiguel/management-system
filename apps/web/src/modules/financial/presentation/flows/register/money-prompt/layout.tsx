import { Button } from '@presentation/components/Button';
import { Modal, ModalActions } from '@presentation/components/Modal';
import type { TMoneyPromptLayoutProps } from './types';

export function MoneyPromptLayout({
  title,
  label,
  submitLabel,
  width,
  raw,
  canSubmit,
  header,
  footerContent,
  onRawChange,
  onSubmit,
  onClose,
}: TMoneyPromptLayoutProps) {
  const labelClass = header ? 's-label mt-2.5' : 's-label';

  return (
    <Modal title={title} onClose={onClose} width={width}>
      {header}
      <div className={labelClass}>{label}</div>
      <div className="s-input">
        <input
          autoFocus
          value={raw}
          onChange={(event) => onRawChange(event.target.value)}
          placeholder="0,00"
          onKeyDown={(event) => (event.key === 'Enter' ? onSubmit() : undefined)}
        />
      </div>
      {footerContent}
      <ModalActions>
        <Button ghost onClick={onClose}>
          Voltar
        </Button>
        <Button primary disabled={!canSubmit} onClick={onSubmit}>
          {submitLabel}
        </Button>
      </ModalActions>
    </Modal>
  );
}
