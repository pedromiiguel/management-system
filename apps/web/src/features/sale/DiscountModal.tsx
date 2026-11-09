import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { DiscountType, discountSchema, type DiscountInput } from '@beverage/shared';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Modal } from '@/components/Modal';
import { parseMoney } from '@/lib/format';
import { SALE_HOTKEYS } from './hotkeys';

// O valor é digitado como texto ("12,50"); as regras são as do shared.
const formSchema = z
  .object({ type: discountSchema.shape.type, raw: z.string() })
  .transform(({ type, raw }) => ({ type, value: parseMoney(raw) }))
  .pipe(discountSchema);

export function DiscountModal({
  onApply,
  onClose,
}: {
  onApply: (discount: DiscountInput | null) => void;
  onClose: () => void;
}) {
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    z.input<typeof formSchema>,
    unknown,
    DiscountInput
  >({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: { type: DiscountType.AMOUNT, raw: '' },
  });
  const type = watch('type');

  return (
    <Modal
      title={`Desconto na venda (${SALE_HOTKEYS.discount.label})`}
      onClose={onClose}
      width={380}
    >
      <form onSubmit={handleSubmit(onApply)}>
        <div className="flex gap-2 mb-2.5">
          <Chip
            active={type === DiscountType.AMOUNT}
            onClick={() => setValue('type', DiscountType.AMOUNT, { shouldValidate: true })}
          >
            Valor (R$)
          </Chip>
          <Chip
            active={type === DiscountType.PERCENT}
            onClick={() => setValue('type', DiscountType.PERCENT, { shouldValidate: true })}
          >
            Percentual (%)
          </Chip>
        </div>
        <div className="s-input">
          <input
            autoFocus
            placeholder={type === DiscountType.AMOUNT ? '0,00' : '0'}
            {...register('raw')}
          />
        </div>
        <div className="flex gap-2 justify-between mt-3.5">
          <Button ghost onClick={() => onApply(null)}>
            Remover desconto
          </Button>
          <div className="flex gap-2">
            <Button ghost onClick={onClose}>
              Voltar
            </Button>
            <Button primary type="submit" disabled={!formState.isValid}>
              Aplicar
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
