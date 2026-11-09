import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { stockEntrySchema } from '@beverage/shared';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { toast } from '@/lib/toast';
import type { Product } from '@/features/products/api';
import { useCreateStockEntry } from './api';
import { PickedProduct, ProductPickerModal } from './ProductPickerModal';

const formSchema = stockEntrySchema.omit({ productId: true });

/** Entrada: soma ao saldo do produto, com custo e lote/validade opcionais. */
export function StockEntryModal({ onClose }: { onClose: () => void }) {
  return (
    <ProductPickerModal
      title="Entrada de estoque"
      width={480}
      searchHint="Digite para buscar o produto"
      onClose={onClose}
    >
      {(product, changeProduct) => (
        <EntryForm product={product} onChangeProduct={changeProduct} onSaved={onClose} />
      )}
    </ProductPickerModal>
  );
}

function EntryForm({
  product,
  onChangeProduct,
  onSaved,
}: {
  product: Product;
  onChangeProduct: () => void;
  onSaved: () => void;
}) {
  const createEntry = useCreateStockEntry();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.input<typeof formSchema>, unknown, z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { quantity: 1 },
  });

  const submit = handleSubmit((input) =>
    createEntry.mutate(
      { ...input, productId: product.id },
      {
        onSuccess: () => {
          toast('Entrada registrada');
          onSaved();
        },
      },
    ),
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <PickedProduct product={product} />
      <div className="flex gap-2.5">
        <Field className="flex-1" label="Quantidade" error={errors.quantity?.message}>
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
            {...register('unitCost', {
              setValueAs: (v: string) => (v === '' ? undefined : Number(v)),
            })}
          />
        </Field>
      </div>
      <div className="flex gap-2.5">
        <Field className="flex-1" label="Lote — opcional">
          <input {...register('batch', { setValueAs: (v: string) => v || undefined })} />
        </Field>
        <Field className="flex-1" label="Validade — opcional">
          <input
            type="date"
            data-testid="entry-expires-at"
            {...register('expiresAt', {
              // AAAA-MM-DD vai como está: data sem hora (ver lib/format).
              setValueAs: (v: string) => v || undefined,
            })}
          />
        </Field>
      </div>
      <div className="flex gap-2 justify-end">
        <Button ghost onClick={onChangeProduct}>
          Trocar produto
        </Button>
        <Button primary type="submit" disabled={createEntry.isPending}>
          {createEntry.isPending ? 'Salvando…' : 'Registrar entrada'}
        </Button>
      </div>
    </form>
  );
}
