import { Button } from '@/presentation/components/Button';
import { Modal } from '@/presentation/components/Modal';
import type { UserModalViewProps } from './UserModal.types';

export function UserModalView({
  name,
  login,
  password,
  roleId,
  roles,
  valid,
  saving,
  onChangeName,
  onChangeLogin,
  onChangePassword,
  onChangeRoleId,
  onSubmit,
  onClose,
}: UserModalViewProps) {
  return (
    <Modal title="Novo usuário" onClose={onClose} width={420}>
      <div className="flex flex-col gap-2.5">
        <div>
          <div className="s-label">Nome</div>
          <div className="s-input">
            <input autoFocus data-testid="user-name" value={name} onChange={(e) => onChangeName(e.target.value)} />
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1">
            <div className="s-label">Login</div>
            <div className="s-input">
              <input data-testid="user-login" value={login} onChange={(e) => onChangeLogin(e.target.value)} />
            </div>
          </div>
          <div className="flex-1">
            <div className="s-label">Senha (mín. 6)</div>
            <div className="s-input">
              <input
                type="password"
                data-testid="user-password"
                value={password}
                onChange={(e) => onChangePassword(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="s-label">Perfil</div>
          <div className="s-input">
            <select data-testid="user-role" value={roleId} onChange={(e) => onChangeRoleId(e.target.value)}>
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary disabled={!valid || saving} onClick={onSubmit}>
            Criar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
