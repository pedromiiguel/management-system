import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { CreateUserInput } from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import { useCreateUser } from '@modules/users/main/users-queries';
import { CREATED_MESSAGE } from './constants';
import { UserFormLayout } from './layout';
import { userFormSchema, type TUserFormInput } from './schema';
import type { TUserFormFlowProps } from './types';

export function UserFormController({ roles, onClose }: TUserFormFlowProps) {
  const create = useCreateUser();
  const { register, handleSubmit, formState } = useForm<TUserFormInput, unknown, CreateUserInput>({
    resolver: zodResolver(userFormSchema),
    mode: 'onChange',
    defaultValues: { name: '', login: '', password: '', roleId: roles[0]?.id ?? '', active: true },
  });

  const handleSave = (input: CreateUserInput) =>
    create.mutate(input, {
      onSuccess: () => {
        toast(CREATED_MESSAGE);
        onClose();
      },
    });

  return (
    <UserFormLayout
      roles={roles}
      register={register}
      canSubmit={formState.isValid && !create.isPending}
      onSubmit={handleSubmit(handleSave)}
      onClose={onClose}
    />
  );
}
