import { Button } from '@presentation/components/Button';
import { Field } from '@presentation/components/Field';
import { Modal } from '@presentation/components/Modal';
import { emptyToUndefined, emptyToUndefinedNumber } from '@presentation/utils/form-values';
import { DEACTIVATE_LABEL_BY_ACTIVE, SUBMIT_LABEL_BY_SAVING, WIDTH } from './constants';
import type { TProductFormLayoutProps } from './types';

export function ProductFormLayout({
  title,
  product,
  register,
  fieldErrors,
  canEnterStock,
  isSaving,
  onSubmit,
  onDeactivateClick,
  onClose,
}: TProductFormLayoutProps) {
  return (
    <Modal title={title} onClose={onClose} width={WIDTH}>
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field className="flex-1" label="Nome" error={fieldErrors.name?.message}>
          <input autoFocus data-testid="product-name" {...register('name')} />
        </Field>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="SKU" error={fieldErrors.sku?.message}>
            <input data-testid="product-sku" {...register('sku')} />
          </Field>
          <Field className="flex-1" label="Código de barras (EAN)" error={fieldErrors.ean?.message}>
            <input {...register('ean')} />
          </Field>
          <Field className="flex-1" label="Unidade" error={fieldErrors.unit?.message}>
            <input {...register('unit')} />
          </Field>
        </div>
        <div className="flex gap-2.5">
          <Field
            className="flex-1"
            label="Preço de compra (R$)"
            error={fieldErrors.purchasePrice?.message}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              data-testid="product-purchase-price"
              {...register('purchasePrice', { valueAsNumber: true })}
            />
          </Field>
          <Field
            className="flex-1"
            label="Preço de venda (R$)"
            error={fieldErrors.salePrice?.message}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              data-testid="product-sale-price"
              {...register('salePrice', { valueAsNumber: true })}
            />
          </Field>
          <Field
            className="flex-1"
            label="Estoque mínimo"
            error={fieldErrors.minimumStock?.message}
          >
            <input type="number" min="0" {...register('minimumStock', { valueAsNumber: true })} />
          </Field>
        </div>
        {canEnterStock ? (
          <div className="border-t border-[var(--line)] pt-3">
            <div className="s-label mb-1.5">
              Adicionar ao estoque — opcional
              {product ? <span className="s-dim"> (atual: {product.currentStock})</span> : null}
            </div>
            <div className="flex gap-2.5">
              <Field
                className="flex-1"
                label="Quantidade"
                error={fieldErrors.stockEntry?.quantity?.message}
              >
                <input
                  type="number"
                  min="1"
                  data-testid="product-stock-entry-quantity"
                  {...register('stockEntry.quantity', { setValueAs: emptyToUndefinedNumber })}
                />
              </Field>
              <Field className="flex-1" label="Lote — opcional">
                <input {...register('stockEntry.batch', { setValueAs: emptyToUndefined })} />
              </Field>
              <Field className="flex-1" label="Validade — opcional">
                <input
                  type="date"
                  {...register('stockEntry.expiresAt', { setValueAs: emptyToUndefined })}
                />
              </Field>
            </div>
          </div>
        ) : null}
        <div className="flex gap-2 justify-between mt-1">
          {product ? (
            <Button ghost danger onClick={onDeactivateClick}>
              {DEACTIVATE_LABEL_BY_ACTIVE[`${product.active}`]}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button ghost onClick={onClose}>
              Voltar
            </Button>
            <Button primary type="submit" disabled={isSaving}>
              {SUBMIT_LABEL_BY_SAVING[`${isSaving}`]}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
