import type { ReactNode } from 'react';
import type { Role } from '@/domain/models/users';

export type UserRowView = { key: string; cells: ReactNode[] };

export type PermissionCell = {
  key: string;
  on: boolean;
  onChange?: (on: boolean) => void;
};

export type PermissionRow = {
  key: string;
  label: string;
  cells: PermissionCell[];
};

export type AccessTabViewProps = {
  userRows: UserRowView[];
  roleHeaders: { id: string; name: string }[];
  permissionRows: PermissionRow[];
  roles: Role[];
  modal: 'none' | 'user' | 'role';
  onOpenUserModal: () => void;
  onOpenRoleModal: () => void;
  onCloseModal: () => void;
  onUserCreated: () => void;
  onRoleCreated: () => void;
};
