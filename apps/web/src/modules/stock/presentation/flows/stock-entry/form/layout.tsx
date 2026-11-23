import { Button } from '@presentation/components/Button';
import { Field } from '@presentation/components/Field';
import { emptyToUndefined, emptyToUndefinedNumber } from '@presentation/utils/form-values';
import { PickedProduct } from '../../../components/product-picker';
import { SUBMIT_LABEL_BY_SAVING } from '../constants';
import type { TStockEntryFormLayoutProps } from '../types';

export function StockEntryFormLayout({
  product,
  register,
  fieldErrors,
  isSaving,
  onChangeProductClick,
  onSubmit,
}: TStockEntryFormLayoutProps) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <PickedProduct product={product} />
      <div className="flex gap-2.5">
        <Field className="flex-1" label="Quantidade" error={fieldErrors.quantity?.message}>
          <input
            autoFocus
            type="number"
            min="1"
            data-testid="entry-quantity"
            {...register('quantity', { valueAsNumber: true })}
          />
        </Field>
        <Field className="flex-1" label="Custo unitário (R$) — opcional">
          <input
            type="number"
            step="0.01"
            min="0"
            {...register('unitCost', { setValueAs: emptyToUndefinedNumber })}
          />
        </Field>
      </div>
      <div className="flex gap-2.5">
        <Field className="flex-1" label="Lote — opcional">
          <input {...register('batch', { setValueAs: emptyToUndefined })} />
        </Field>
        <Field className="flex-1" label="Validade — opcional">
          <input
            type="date"
            data-testid="entry-expires-at"
            {...register('expiresAt', { setValueAs: emptyToUndefined })}
          />
        </Field>
      </div>
      <div className="flex gap-2 justify-end">
        <Button ghost onClick={onChangeProductClick}>
          Trocar produto
        </Button>
        <Button primary type="submit" disabled={isSaving}>
          {SUBMIT_LABEL_BY_SAVING[`${isSaving}`]}
        </Button>
      </div>
    </form>
  );
}
