import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import type { Permission } from '@beverage/shared';
import { toggleItem } from '@presentation/utils/toggle-item';
import { rolesQuery, usersQuery, useUpdateRole } from '@modules/users/main/users-queries';
import type { IRole } from '../../../domain/user-model';
import { AccessLayout } from './layout';
import type { TAccessModal } from './types';

/** Usuários e a matriz de permissões por perfil (papéis são conjuntos de permissões). */
export function AccessController() {
  const [modalState, setModalState] = useState<TAccessModal>('none');
  const { data: users = [] } = useQuery(usersQuery());
  const { data: roles = [] } = useQuery(rolesQuery());
  const updateRole = useUpdateRole();

  const handlePermissionToggle = (role: IRole, permission: Permission, isOn: boolean) =>
    updateRole.mutate({
      id: role.id,
      input: { permissions: toggleItem(role.permissions, permission, isOn) },
    });

  return (
    <AccessLayout
      users={users}
      roles={roles}
      modal={modalState}
      onNewUserClick={() => setModalState('user')}
      onNewRoleClick={() => setModalState('role')}
      onPermissionToggle={handlePermissionToggle}
      onModalClose={() => setModalState('none')}
    />
  );
}
