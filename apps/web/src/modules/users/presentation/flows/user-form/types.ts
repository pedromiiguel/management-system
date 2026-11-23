import type { UseFormRegister } from 'react-hook-form';
import type { IRole } from '../../../domain/user-model';
import type { TUserFormInput } from './schema';

export type TUserFormFlowProps = { roles: IRole[]; onClose: () => void };

export type TUserFormLayoutProps = {
  roles: IRole[];
  register: UseFormRegister<TUserFormInput>;
  canSubmit: boolean;
  onSubmit: () => void;
  onClose: () => void;
};
