import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/presentation/components/Toast';
import type { Role } from '@/domain/models/users';
import { apiErrorMessage } from '@/lib/api';
import { useUpdateRoleMutation } from '@/main/factories/mutations/users';
import { useRolesQuery, useUsersQuery } from '@/main/factories/queries/users';

export function useAccessTabModel() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'none' | 'user' | 'role'>('none');

  const { data: users = [] } = useUsersQuery();
  const { data: roles = [] } = useRolesQuery();

  const updateRole = useUpdateRoleMutation();

  const togglePermission = (role: Role, permission: string, on: boolean) => {
    updateRole.mutate(
      {
        id: role.id,
        input: {
          name: role.name,
          permissions: on
            ? [...role.permissions, permission]
            : role.permissions.filter((p) => p !== permission),
        },
      },
      {
        onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['roles'] }),
        onError: (error) => toast(apiErrorMessage(error), 'danger'),
      },
    );
  };

  const openUserModal = () => setModal('user');
  const openRoleModal = () => setModal('role');
  const closeModal = () => setModal('none');

  const onUserCreated = () => {
    void queryClient.invalidateQueries({ queryKey: ['users'] });
    closeModal();
  };

  const onRoleCreated = () => {
    void queryClient.invalidateQueries({ queryKey: ['roles'] });
    closeModal();
  };

  return {
    users,
    roles,
    modal,
    togglePermission,
    openUserModal,
    openRoleModal,
    closeModal,
    onUserCreated,
    onRoleCreated,
  };
}
