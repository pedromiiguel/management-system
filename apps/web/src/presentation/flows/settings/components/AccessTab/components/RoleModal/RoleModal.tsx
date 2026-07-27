import { ALL_PERMISSIONS, PERMISSION_LABELS, type Permission } from '@beverage/shared';
import { useRoleModalModel } from './RoleModal.model';
import { RoleModalView } from './RoleModal.view';
import type { PermissionOption, RoleModalProps } from './RoleModal.types';

export function RoleModal({ onDone, onClose }: RoleModalProps) {
  const { name, setName, permissions, togglePermission, valid, saving, submit } = useRoleModalModel(onDone);

  const permissionOptions: PermissionOption[] = ALL_PERMISSIONS.map((permission) => ({
    permission,
    label: PERMISSION_LABELS[permission as Permission],
    on: permissions.includes(permission),
  }));

  return (
    <RoleModalView
      name={name}
      onChangeName={setName}
      permissionOptions={permissionOptions}
      onTogglePermission={togglePermission}
      valid={valid}
      saving={saving}
      onSubmit={submit}
      onClose={onClose}
    />
  );
}
