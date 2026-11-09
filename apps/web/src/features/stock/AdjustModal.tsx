import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { stockAdjustmentSchema } from '@beverage/shared';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { toast } from '@/lib/toast';
import type { Product } from '@/features/products/api';
import { useCreateStockAdjustment } from './api';
import { PickedProduct, ProductPickerModal } from './ProductPickerModal';

const formSchema = stockAdjustmentSchema.omit({ productId: true });

/** Ajustar: corrige o saldo (para mais ou para menos) com motivo auditável. */
export function AdjustModal({ onClose }: { onClose: () => void }) {
  return (
    <ProductPickerModal
      title="Ajuste manual de estoque"
      width={460}
      searchHint="Digite para buscar"
      onClose={onClose}
    >
      {(product, changeProduct) => (
        <AdjustForm product={product} onChangeProduct={changeProduct} onSaved={onClose} />
      )}
    </ProductPickerModal>
  );
}

function AdjustForm({
  product,
  onChangeProduct,
  onSaved,
}: {
  product: Product;
  onChangeProduct: () => void;
  onSaved: () => void;
}) {
  const createAdjustment = useCreateStockAdjustment();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<z.input<typeof formSchema>, unknown, z.output<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
  });

  const submit = handleSubmit((input) =>
    createAdjustment.mutate(
      { ...input, productId: product.id },
      {
        onSuccess: () => {
          toast('Ajuste registrado');
          onSaved();
        },
      },
    ),
  );

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <PickedProduct product={product} />
      <Field label="Quantidade (positivo aumenta, negativo reduz)" error={errors.quantity?.message}>
        <input
          autoFocus
          type="number"
          placeholder="ex.: -3 (quebra), 10 (inventário)"
          {...register('quantity', { valueAsNumber: true })}
        />
      </Field>
      <Field label="Motivo (auditável)" error={errors.reason?.message}>
        <input placeholder="ex.: quebra, perda, contagem de inventário" {...register('reason')} />
      </Field>
      <div className="flex gap-2 justify-end">
        <Button ghost onClick={onChangeProduct}>
          Trocar produto
        </Button>
        <Button primary type="submit" disabled={!isValid || createAdjustment.isPending}>
          {createAdjustment.isPending ? 'Salvando…' : 'Registrar ajuste'}
        </Button>
      </div>
    </form>
  );
}
