import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { CashMovementType, type CashMovementInput } from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import { useCreateCashMovement } from '@modules/financial/main/financial-queries';
import {
  OTHER_PLACEHOLDER,
  OTHER_SAVED_MESSAGE,
  PULL_PLACEHOLDER,
  PULL_SAVED_MESSAGE,
} from './constants';
import { CashMovementFormLayout } from './layout';
import { cashMovementFormSchema, type TCashMovementFormInput } from './schema';
import type { TCashMovementFormFlowProps } from './types';

/** Sangria, suprimento ou saída avulsa do caixa aberto. */
export function CashMovementFormController({ onClose }: TCashMovementFormFlowProps) {
  const create = useCreateCashMovement();
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    TCashMovementFormInput,
    unknown,
    CashMovementInput
  >({
    resolver: zodResolver(cashMovementFormSchema),
    mode: 'onChange',
    defaultValues: { type: CashMovementType.PULL, amount: '', description: '' },
  });
  const type = watch('type');
  const isPull = type === CashMovementType.PULL;

  const handleSave = (input: CashMovementInput) =>
    create.mutate(input, {
      onSuccess: () => {
        toast(input.type === CashMovementType.PULL ? PULL_SAVED_MESSAGE : OTHER_SAVED_MESSAGE);
        onClose();
      },
    });

  return (
    <CashMovementFormLayout
      type={type}
      register={register}
      descriptionPlaceholder={isPull ? PULL_PLACEHOLDER : OTHER_PLACEHOLDER}
      canSubmit={formState.isValid && !create.isPending}
      onTypeClick={(next) => setValue('type', next, { shouldValidate: true })}
      onSubmit={handleSubmit(handleSave)}
      onClose={onClose}
    />
  );
}
