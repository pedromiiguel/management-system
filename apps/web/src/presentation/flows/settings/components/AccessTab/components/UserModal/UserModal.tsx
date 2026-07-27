import { useUserModalModel } from './UserModal.model';
import { UserModalView } from './UserModal.view';
import type { UserModalProps } from './UserModal.types';

export function UserModal({ roles, onDone, onClose }: UserModalProps) {
  const { name, setName, login, setLogin, password, setPassword, roleId, setRoleId, valid, saving, submit } =
    useUserModalModel(roles, onDone);

  return (
    <UserModalView
      name={name}
      login={login}
      password={password}
      roleId={roleId}
      roles={roles}
      valid={valid}
      saving={saving}
      onChangeName={setName}
      onChangeLogin={setLogin}
      onChangePassword={setPassword}
      onChangeRoleId={setRoleId}
      onSubmit={submit}
      onClose={onClose}
    />
  );
}
