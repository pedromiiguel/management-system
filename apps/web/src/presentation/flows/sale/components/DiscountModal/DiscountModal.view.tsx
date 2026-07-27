import { Button } from '@/presentation/components/Button';
import { Chip } from '@/presentation/components/Chip';
import { Modal } from '@/presentation/components/Modal';
import type { DiscountModalViewProps } from './DiscountModal.types';

export function DiscountModalView({
  register,
  selectedType,
  onSelectType,
  placeholder,
  onSubmit,
  canApply,
  onRemove,
  onClose,
}: DiscountModalViewProps) {
  return (
    <Modal title="Desconto na venda (F4)" onClose={onClose} width={380}>
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 mb-2.5">
          <Chip active={selectedType === 'AMOUNT'} onClick={() => onSelectType('AMOUNT')}>
            Valor (R$)
          </Chip>
          <Chip active={selectedType === 'PERCENT'} onClick={() => onSelectType('PERCENT')}>
            Percentual (%)
          </Chip>
        </div>
        <div className="s-input">
          <input autoFocus placeholder={placeholder} {...register('raw')} />
        </div>
        <div className="flex gap-2 justify-between mt-3.5">
          <Button ghost onClick={onRemove}>
            Remover desconto
          </Button>
          <div className="flex gap-2">
            <Button ghost onClick={onClose}>
              Voltar
            </Button>
            <Button primary type="submit" disabled={!canApply}>
              Aplicar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
