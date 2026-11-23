import type { UseFormRegister } from 'react-hook-form';
import type { Permission, RoleInput } from '@beverage/shared';

export type TRoleFormFlowProps = { onClose: () => void };

export type TRoleFormLayoutProps = {
  register: UseFormRegister<RoleInput>;
  permissions: Permission[];
  canSubmit: boolean;
  onPermissionToggle: (permission: Permission, isOn: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
};
