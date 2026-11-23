import { FinancialCategoryKind } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Chip } from '@presentation/components/Chip';
import { Modal, ModalActions } from '@presentation/components/Modal';
import { CategorySelect } from '../../../components/category-select';
import type { TManualEntryFormLayoutProps } from './types';

export function ManualEntryFormLayout({
  kind,
  categories,
  register,
  canSubmit,
  onKindClick,
  onSubmit,
  onClose,
}: TManualEntryFormLayoutProps) {
  return (
    <Modal title="Lançamento avulso (FR-35)" onClose={onClose} width={420}>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 mb-3">
          <Chip
            active={kind === FinancialCategoryKind.EXPENSE}
            onClick={() => onKindClick(FinancialCategoryKind.EXPENSE)}
          >
            Despesa
          </Chip>
          <Chip
            active={kind === FinancialCategoryKind.INCOME}
            onClick={() => onKindClick(FinancialCategoryKind.INCOME)}
          >
            Receita
          </Chip>
        </div>
        <div className="s-label">Valor (R$)</div>
        <div className="s-input mb-2.5">
          <input
            autoFocus
            data-testid="manual-entry-amount"
            placeholder="0,00"
            {...register('amount')}
          />
        </div>
        <div className="s-label">Descrição</div>
        <div className="s-input mb-2.5">
          <input data-testid="manual-entry-description" {...register('description')} />
        </div>
        <div className="s-label">Categoria</div>
        <div className="s-input">
          <CategorySelect categories={categories} registration={register('categoryId')} />
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
