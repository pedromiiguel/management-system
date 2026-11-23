import { DiscountType } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Chip } from '@presentation/components/Chip';
import { Modal } from '@presentation/components/Modal';
import { SALE_HOTKEYS } from '../constants';
import type { TDiscountModalLayoutProps } from './types';

export function DiscountModalLayout({
  type,
  register,
  canApply,
  onTypeChange,
  onSubmit,
  onRemove,
  onClose,
}: TDiscountModalLayoutProps) {
  const placeholder = type === DiscountType.AMOUNT ? '0,00' : '0';

  return (
    <Modal
      title={`Desconto na venda (${SALE_HOTKEYS.discount.label})`}
      onClose={onClose}
      width={380}
    >
      <form onSubmit={onSubmit}>
        <div className="flex gap-2 mb-2.5">
          <Chip
            active={type === DiscountType.AMOUNT}
            onClick={() => onTypeChange(DiscountType.AMOUNT)}
          >
            Valor (R$)
          </Chip>
          <Chip
            active={type === DiscountType.PERCENT}
            onClick={() => onTypeChange(DiscountType.PERCENT)}
          >
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
