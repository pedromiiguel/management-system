import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Permission,
  productSchema,
  productStockEntrySchema,
  type ProductInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { Modal } from '@/components/Modal';
import { toast } from '@/components/Toast';
import { hasPermission, useSession } from '@/lib/session';
import { useDeactivateProduct, useSaveProduct, type Product } from './api';

// Entrada embutida (CONTEXT.md, Entrada): opcional — só vira movimento de estoque se a
// quantidade for preenchida. O custo é o preço de compra do próprio formulário.
const formSchema = productSchema
  .extend({ stockEntry: productStockEntrySchema.partial().optional() })
  .transform(
    ({ stockEntry, ...product }): ProductInput => ({
      ...product,
      ...(stockEntry?.quantity
        ? {
            stockEntry: {
              quantity: stockEntry.quantity,
              batch: stockEntry.batch,
              expiresAt: stockEntry.expiresAt,
            },
          }
        : {}),
    }),
  );

const optional = (v: string) => v || undefined;

export function ProductModal({ product, onClose }: { product?: Product; onClose: () => void }) {
  const canEnterStock = hasPermission(useSession(), Permission.STOCK_WRITE);
  const save = useSaveProduct();
  const deactivate = useDeactivateProduct();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof formSchema>, unknown, ProductInput>({
    resolver: zodResolver(formSchema),
    defaultValues: product
      ? { ...product, ean: product.ean ?? '' }
      : { unit: 'un', minimumStock: 0, active: true },
  });

  const submit = handleSubmit((input) =>
    save.mutate(product ? { id: product.id, input } : { input }, {
      onSuccess: () => {
        toast(product ? 'Produto atualizado' : 'Produto cadastrado');
        onClose();
      },
    }),
  );

  const handleDeactivate = () => {
    if (!product) return;
    deactivate.mutate(product.id, {
      onSuccess: () => {
        toast('Produto desativado');
        onClose();
      },
    });
  };

  return (
    <Modal
      title={product ? `Editar — ${product.name}` : 'Novo produto'}
      onClose={onClose}
      width={520}
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <Field className="flex-1" label="Nome" error={errors.name?.message}>
          <input autoFocus data-testid="product-name" {...register('name')} />
        </Field>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="SKU" error={errors.sku?.message}>
            <input data-testid="product-sku" {...register('sku')} />
          </Field>
          <Field className="flex-1" label="Código de barras (EAN)" error={errors.ean?.message}>
            <input {...register('ean')} />
          </Field>
          <Field className="flex-1" label="Unidade" error={errors.unit?.message}>
            <input {...register('unit')} />
          </Field>
        </div>
        <div className="flex gap-2.5">
          <Field
            className="flex-1"
            label="Preço de compra (R$)"
            error={errors.purchasePrice?.message}
          >
            <input
              type="number"
              step="0.01"
              min="0"
              data-testid="product-purchase-price"
              {...register('purchasePrice', { valueAsNumber: true })}
            />
          </Field>
          <Field className="flex-1" label="Preço de venda (R$)" error={errors.salePrice?.message}>
            <input
              type="number"
              step="0.01"
              min="0"
              data-testid="product-sale-price"
              {...register('salePrice', { valueAsNumber: true })}
            />
          </Field>
          <Field className="flex-1" label="Estoque mínimo" error={errors.minimumStock?.message}>
            <input type="number" min="0" {...register('minimumStock', { valueAsNumber: true })} />
          </Field>
        </div>
        {canEnterStock && (
          <div className="border-t border-[var(--line)] pt-3">
            <div className="s-label mb-1.5">
              Adicionar ao estoque — opcional
              {product && <span className="s-dim"> (atual: {product.currentStock})</span>}
            </div>
            <div className="flex gap-2.5">
              <Field
                className="flex-1"
                label="Quantidade"
                error={errors.stockEntry?.quantity?.message}
              >
                <input
                  type="number"
                  min="1"
                  data-testid="product-stock-entry-quantity"
                  {...register('stockEntry.quantity', {
                    setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
                  })}
                />
              </Field>
              <Field className="flex-1" label="Lote — opcional">
                <input {...register('stockEntry.batch', { setValueAs: optional })} />
              </Field>
              <Field className="flex-1" label="Validade — opcional">
                <input
                  type="date"
                  {...register('stockEntry.expiresAt', {
                    setValueAs: (v: string) => (v ? new Date(v) : undefined),
                  })}
                />
              </Field>
            </div>
          </div>
        )}
        <div className="flex gap-2 justify-between mt-1">
          {product ? (
            <Button ghost danger onClick={handleDeactivate}>
              {product.active ? 'Desativar' : 'Produto inativo'}
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button ghost onClick={onClose}>
              Voltar
            </Button>
            <Button primary type="submit" disabled={save.isPending}>
              {save.isPending ? 'Salvando…' : 'Salvar'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
