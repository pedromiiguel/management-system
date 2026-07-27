import { ALL_PERMISSIONS, PERMISSION_LABELS, type Permission } from '@beverage/shared';
import { Checkbox } from '@/presentation/components/Checkbox';
import { Tag } from '@/presentation/components/Tag';
import { useAccessTabModel } from './AccessTab.model';
import { AccessTabView } from './AccessTab.view';
import type { PermissionRow, UserRowView } from './AccessTab.types';

export function AccessTab() {
  const {
    users,
    roles,
    modal,
    togglePermission,
    openUserModal,
    openRoleModal,
    closeModal,
    onUserCreated,
    onRoleCreated,
  } = useAccessTabModel();

  const userRows: UserRowView[] = users.map((u) => ({
    key: u.id,
    cells: [
      `${u.name} (${u.login})`,
      <Tag key="r" tone="accent">
        {u.role.name}
      </Tag>,
      <Checkbox key="a" on={u.active} />,
    ],
  }));

  const permissionRows: PermissionRow[] = ALL_PERMISSIONS.map((permission) => ({
    key: permission,
    label: PERMISSION_LABELS[permission as Permission],
    cells: roles.map((role) => ({
      key: role.id,
      on: role.permissions.includes(permission),
      onChange: role.system ? undefined : (on: boolean) => togglePermission(role, permission, on),
    })),
  }));

  return (
    <AccessTabView
      userRows={userRows}
      roleHeaders={roles.map((r) => ({ id: r.id, name: r.name }))}
      permissionRows={permissionRows}
      roles={roles}
      modal={modal}
      onOpenUserModal={openUserModal}
      onOpenRoleModal={openRoleModal}
      onCloseModal={closeModal}
      onUserCreated={onUserCreated}
      onRoleCreated={onRoleCreated}
    />
  );
}
