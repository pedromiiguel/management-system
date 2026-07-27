import { Button } from '@/presentation/components/Button';
import { Modal } from '@/presentation/components/Modal';
import type { MoneyPromptModalViewProps } from './MoneyPromptModal.types';

export function MoneyPromptModalView({
  title,
  label,
  submitLabel,
  raw,
  valid,
  onChangeRaw,
  onSubmit,
  onClose,
}: MoneyPromptModalViewProps) {
  return (
    <Modal title={title} onClose={onClose} width={380}>
      <div className="s-label">{label}</div>
      <div className="s-input">
        <input
          autoFocus
          value={raw}
          onChange={(e) => onChangeRaw(e.target.value)}
          placeholder="0,00"
          onKeyDown={(e) => e.key === 'Enter' && valid && onSubmit()}
        />
      </div>
      <div className="flex gap-2 justify-end mt-3.5">
        <Button ghost onClick={onClose}>Voltar</Button>
        <Button primary disabled={!valid} onClick={onSubmit}>{submitLabel}</Button>
      </div>
    </Modal>
  );
}
