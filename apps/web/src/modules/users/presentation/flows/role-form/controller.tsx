import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { roleSchema, type Permission, type RoleInput } from '@beverage/shared';
import { toast } from '@presentation/utils/toast';
import { toggleItem } from '@presentation/utils/toggle-item';
import { useCreateRole } from '@modules/users/main/users-queries';
import { CREATED_MESSAGE, DEFAULT_VALUES } from './constants';
import { RoleFormLayout } from './layout';
import type { TRoleFormFlowProps } from './types';

export function RoleFormController({ onClose }: TRoleFormFlowProps) {
  const create = useCreateRole();
  const { register, handleSubmit, watch, setValue, formState } = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_VALUES,
  });
  const permissions = watch('permissions');

  const handlePermissionToggle = (permission: Permission, isOn: boolean) =>
    setValue('permissions', toggleItem(permissions, permission, isOn), { shouldValidate: true });

  const handleSave = (input: RoleInput) =>
    create.mutate(input, {
      onSuccess: () => {
        toast(CREATED_MESSAGE);
        onClose();
      },
    });

  return (
    <RoleFormLayout
      register={register}
      permissions={permissions}
      canSubmit={formState.isValid && !create.isPending}
      onPermissionToggle={handlePermissionToggle}
      onSubmit={handleSubmit(handleSave)}
      onClose={onClose}
    />
  );
}
