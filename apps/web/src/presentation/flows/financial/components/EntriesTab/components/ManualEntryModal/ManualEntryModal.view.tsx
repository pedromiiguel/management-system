import { Button } from '@/presentation/components/Button';
import { Chip } from '@/presentation/components/Chip';
import { Modal } from '@/presentation/components/Modal';
import type { ManualEntryModalViewProps } from './ManualEntryModal.types';

export function ManualEntryModalView({
  kind,
  raw,
  description,
  categoryId,
  categories,
  valid,
  saving,
  onChangeKind,
  onChangeRaw,
  onChangeDescription,
  onChangeCategoryId,
  onSubmit,
  onClose,
}: ManualEntryModalViewProps) {
  return (
    <Modal title="Lançamento avulso (FR-35)" onClose={onClose} width={420}>
      <div className="flex gap-2 mb-3">
        <Chip active={kind === 'EXPENSE'} onClick={() => onChangeKind('EXPENSE')}>Despesa</Chip>
        <Chip active={kind === 'INCOME'} onClick={() => onChangeKind('INCOME')}>Receita</Chip>
      </div>
      <div className="s-label">Valor (R$)</div>
      <div className="s-input mb-2.5">
        <input
          autoFocus
          data-testid="manual-entry-amount"
          value={raw}
          onChange={(e) => onChangeRaw(e.target.value)}
          placeholder="0,00"
        />
      </div>
      <div className="s-label">Descrição</div>
      <div className="s-input mb-2.5">
        <input
          data-testid="manual-entry-description"
          value={description}
          onChange={(e) => onChangeDescription(e.target.value)}
        />
      </div>
      <div className="s-label">Categoria</div>
      <div className="s-input">
        <select value={categoryId} onChange={(e) => onChangeCategoryId(e.target.value)}>
          <option value="">—</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="flex gap-2 justify-end mt-3.5">
        <Button ghost onClick={onClose}>Voltar</Button>
        <Button primary disabled={!valid || saving} onClick={onSubmit}>Registrar</Button>
      </div>
    </Modal>
  );
}
