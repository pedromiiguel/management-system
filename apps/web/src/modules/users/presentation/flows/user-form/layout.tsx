import { Button } from '@presentation/components/Button';
import { Field } from '@presentation/components/Field';
import { Modal } from '@presentation/components/Modal';
import type { TUserFormLayoutProps } from './types';

export function UserFormLayout({
  roles,
  register,
  canSubmit,
  onSubmit,
  onClose,
}: TUserFormLayoutProps) {
  return (
    <Modal title="Novo usuário" onClose={onClose} width={420}>
      <form onSubmit={onSubmit} className="flex flex-col gap-2.5">
        <Field label="Nome">
          <input autoFocus data-testid="user-name" {...register('name')} />
        </Field>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="Login">
            <input data-testid="user-login" {...register('login')} />
          </Field>
          <Field className="flex-1" label="Senha (mín. 6)">
            <input type="password" data-testid="user-password" {...register('password')} />
          </Field>
        </div>
        <Field label="Perfil">
          <select data-testid="user-role" {...register('roleId')}>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2 justify-end">
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!canSubmit}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
