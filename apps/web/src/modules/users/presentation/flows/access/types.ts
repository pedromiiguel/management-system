import type { Permission } from '@beverage/shared';
import type { IRole, IUser } from '../../../domain/user-model';

export type TAccessModal = 'none' | 'user' | 'role';

export type TAccessLayoutProps = {
  users: IUser[];
  roles: IRole[];
  modal: TAccessModal;
  onNewUserClick: () => void;
  onNewRoleClick: () => void;
  onPermissionToggle: (role: IRole, permission: Permission, isOn: boolean) => void;
  onModalClose: () => void;
};
