import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from '@presentation/utils/toast';
import { useCreateStockEntry } from '@modules/stock/main/stock-queries';
import { DEFAULT_VALUES, SAVED_MESSAGE } from '../constants';
import {
  stockEntryFormSchema,
  type TStockEntryFormInput,
  type TStockEntryFormOutput,
} from '../schema';
import type { TStockEntryFormProps } from '../types';
import { StockEntryFormLayout } from './layout';

export function StockEntryFormController({
  product,
  onChangeProduct,
  onSaved,
}: TStockEntryFormProps) {
  const createEntry = useCreateStockEntry();
  const { register, handleSubmit, formState } = useForm<
    TStockEntryFormInput,
    unknown,
    TStockEntryFormOutput
  >({
    resolver: zodResolver(stockEntryFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const handleSave = (input: TStockEntryFormOutput) =>
    createEntry.mutate(
      { ...input, productId: product.id },
      {
        onSuccess: () => {
          toast(SAVED_MESSAGE);
          onSaved();
        },
      },
    );

  return (
    <StockEntryFormLayout
      product={product}
      register={register}
      fieldErrors={formState.errors}
      isSaving={createEntry.isPending}
      onChangeProductClick={onChangeProduct}
      onSubmit={handleSubmit(handleSave)}
    />
  );
}
