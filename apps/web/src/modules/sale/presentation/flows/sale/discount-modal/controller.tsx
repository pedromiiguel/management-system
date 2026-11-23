import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { DiscountType, type DiscountInput } from '@beverage/shared';
import { DiscountModalLayout } from './layout';
import { discountFormSchema, type TDiscountFormValues } from './schema';
import type { TDiscountModalProps } from './types';

/** Desconto na venda (F4), em R$ ou em %. */
export function DiscountModalController({ onApply, onClose }: TDiscountModalProps) {
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    TDiscountFormValues,
    unknown,
    DiscountInput
  >({
    resolver: zodResolver(discountFormSchema),
    mode: 'onChange',
    defaultValues: { type: DiscountType.AMOUNT, raw: '' },
  });

  return (
    <DiscountModalLayout
      type={watch('type')}
      register={register}
      canApply={formState.isValid}
      onTypeChange={(type) => setValue('type', type, { shouldValidate: true })}
      onSubmit={handleSubmit(onApply)}
      onRemove={() => onApply(null)}
      onClose={onClose}
    />
  );
}
