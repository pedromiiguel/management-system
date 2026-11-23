import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@presentation/utils/toast';
import { useCreateStockAdjustment } from '@modules/stock/main/stock-queries';
import { SAVED_MESSAGE } from '../constants';
import {
  stockAdjustmentFormSchema,
  type TStockAdjustmentFormInput,
  type TStockAdjustmentFormOutput,
} from '../schema';
import type { TStockAdjustmentFormProps } from '../types';
import { StockAdjustmentFormLayout } from './layout';

export function StockAdjustmentFormController({
  product,
  onChangeProduct,
  onSaved,
}: TStockAdjustmentFormProps) {
  const createAdjustment = useCreateStockAdjustment();
  const { register, handleSubmit, formState } = useForm<
    TStockAdjustmentFormInput,
    unknown,
    TStockAdjustmentFormOutput
  >({
    resolver: zodResolver(stockAdjustmentFormSchema),
    mode: 'onChange',
  });

  const handleSave = (input: TStockAdjustmentFormOutput) =>
    createAdjustment.mutate(
      { ...input, productId: product.id },
      {
        onSuccess: () => {
          toast(SAVED_MESSAGE);
          onSaved();
        },
      },
    );

  return (
    <StockAdjustmentFormLayout
      product={product}
      register={register}
      fieldErrors={formState.errors}
      canSubmit={formState.isValid && !createAdjustment.isPending}
      isSaving={createAdjustment.isPending}
      onChangeProductClick={onChangeProduct}
      onSubmit={handleSubmit(handleSave)}
    />
  );
}
