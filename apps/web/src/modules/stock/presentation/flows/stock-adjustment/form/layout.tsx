import { Button } from '@presentation/components/Button';
import { Field } from '@presentation/components/Field';
import { PickedProduct } from '../../../components/product-picker';
import { SUBMIT_LABEL_BY_SAVING } from '../constants';
import type { TStockAdjustmentFormLayoutProps } from '../types';

export function StockAdjustmentFormLayout({
  product,
  register,
  fieldErrors,
  canSubmit,
  isSaving,
  onChangeProductClick,
  onSubmit,
}: TStockAdjustmentFormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <PickedProduct product={product} />
      <Field
        label="Quantidade (positivo aumenta, negativo reduz)"
        error={fieldErrors.quantity?.message}
      >
        <input
          autoFocus
          type="number"
          placeholder="ex.: -3 (quebra), 10 (inventário)"
          {...register('quantity', { valueAsNumber: true })}
        />
      </Field>
      <Field label="Motivo (auditável)" error={fieldErrors.reason?.message}>
        <input placeholder="ex.: quebra, perda, contagem de inventário" {...register('reason')} />
      </Field>
      <div className="flex gap-2 justify-end">
        <Button ghost onClick={onChangeProductClick}>
          Trocar produto
        </Button>
        <Button primary type="submit" disabled={!canSubmit}>
          {SUBMIT_LABEL_BY_SAVING[`${isSaving}`]}
        </Button>
      </div>
    </form>
  );
}
