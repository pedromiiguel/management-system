import { CASH_MOVEMENT_LABELS } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Chip } from '@presentation/components/Chip';
import { Modal, ModalActions } from '@presentation/components/Modal';
import { MOVEMENT_TYPES } from './constants';
import type { TCashMovementFormLayoutProps } from './types';

export function CashMovementFormLayout({
  type,
  register,
  descriptionPlaceholder,
  canSubmit,
  onTypeClick,
  onSubmit,
  onClose,
}: TCashMovementFormLayoutProps) {
  return (
    <Modal title="Movimento de caixa" onClose={onClose} width={420}>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 mb-3">
          {MOVEMENT_TYPES.map((movementType) => (
            <Chip
              key={movementType}
              active={type === movementType}
              onClick={() => onTypeClick(movementType)}
            >
              {CASH_MOVEMENT_LABELS[movementType]}
            </Chip>
          ))}
        </div>
        <div className="s-label">Valor (R$)</div>
        <div className="s-input mb-2.5">
          <input
            autoFocus
            data-testid="cash-move-amount"
            placeholder="0,00"
            {...register('amount')}
          />
        </div>
        <div className="s-label">Descrição</div>
        <div className="s-input">
          <input
            data-testid="cash-move-description"
            placeholder={descriptionPlaceholder}
            {...register('description')}
          />
        </div>
        <ModalActions>
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!canSubmit}>
            Registrar
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
