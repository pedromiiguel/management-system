import type { Role } from '@/domain/models/users';

export type UserModalProps = {
  roles: Role[];
  onDone: () => void;
  onClose: () => void;
};

export type UserModalViewProps = {
  name: string;
  login: string;
  password: string;
  roleId: string;
  roles: Role[];
  valid: boolean;
  saving: boolean;
  onChangeName: (value: string) => void;
  onChangeLogin: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeRoleId: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};
