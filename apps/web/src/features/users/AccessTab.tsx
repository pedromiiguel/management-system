import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  ALL_PERMISSIONS,
  createUserSchema,
  PERMISSION_LABELS,
  roleSchema,
  type CreateUserInput,
  type Permission,
  type RoleInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Modal, ModalActions } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/lib/toast';
import {
  rolesQuery,
  useCreateRole,
  useCreateUser,
  usersQuery,
  useUpdateRole,
  type Role,
} from './api';

/** Usuários e a matriz de permissões por perfil (papéis são conjuntos de permissões). */
export function AccessTab() {
  const [modal, setModal] = useState<'none' | 'user' | 'role'>('none');
  const { data: users = [] } = useQuery(usersQuery());
  const { data: roles = [] } = useQuery(rolesQuery());
  const updateRole = useUpdateRole();
  const closeModal = () => setModal('none');
  const columns = `1fr repeat(${roles.length}, 105px)`;

  const togglePermission = (role: Role, permission: Permission, on: boolean) =>
    updateRole.mutate({
      id: role.id,
      input: {
        permissions: on
          ? [...role.permissions, permission]
          : role.permissions.filter((p) => p !== permission),
      },
    });

  return (
    <div className="grid grid-cols-[350px_1fr] gap-3 flex-1 min-h-0">
      <Card pad={8} className="overflow-auto">
        <div className="flex justify-between items-center px-2.5 pt-2 pb-1">
          <div className="s-card-title m-0">Usuários</div>
          <Button primary onClick={() => setModal('user')}>
            + Novo usuário
          </Button>
        </div>
        <Table
          cols={['Nome', 'Perfil', 'Ativo']}
          widths="1fr 100px 60px"
          align={[null, null, 'center']}
          dense
          rows={users.map((u) => ({
            key: u.id,
            cells: [
              `${u.name} (${u.login})`,
              <Tag tone="accent">{u.role.name}</Tag>,
              <Checkbox on={u.active} />,
            ],
          }))}
        />
        <div className="s-dim text-[12.5px] p-2.5">
          O MVP opera apenas com o perfil Admin. Os demais perfis já ficam mapeados para a
          contratação futura.
        </div>
      </Card>

      <Card className="overflow-auto">
        <div className="flex justify-between items-center mb-2.5">
          <div className="s-card-title m-0">Matriz de permissões por perfil</div>
          <Button ghost onClick={() => setModal('role')}>
            + Novo perfil
          </Button>
        </div>
        <div className="s-table is-dense">
          <div className="s-tr s-th" style={{ gridTemplateColumns: columns }}>
            <div>Funcionalidade</div>
            {roles.map((r) => (
              <div key={r.id} className="text-center">
                {r.name}
              </div>
            ))}
          </div>
          {ALL_PERMISSIONS.map((permission) => (
            <div key={permission} className="s-tr" style={{ gridTemplateColumns: columns }}>
              <div>{PERMISSION_LABELS[permission]}</div>
              {roles.map((role) => (
                <div key={role.id} className="text-center">
                  <Checkbox
                    on={role.permissions.includes(permission)}
                    onChange={
                      role.system ? undefined : (on) => togglePermission(role, permission, on)
                    }
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="s-dim text-[12.5px] mt-2.5">
          Permissões são conjuntos configuráveis por funcionalidade — novos perfis não exigem
          reprogramação.
        </div>
      </Card>

      {modal === 'user' ? <UserModal roles={roles} onClose={closeModal} /> : null}
      {modal === 'role' ? <RoleModal onClose={closeModal} /> : null}
    </div>
  );
}

/** Sem `onChange`, é só leitura. */
function Checkbox({ on, onChange }: { on: boolean; onChange?: (on: boolean) => void }) {
  return (
    <button
      className={clsx('s-checkbox', on && 'is-on')}
      onClick={onChange ? () => onChange(!on) : undefined}
      type="button"
      style={onChange ? undefined : { cursor: 'default' }}
    >
      {on ? '✓' : ''}
    </button>
  );
}

function UserModal({ roles, onClose }: { roles: Role[]; onClose: () => void }) {
  const create = useCreateUser();
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof createUserSchema>,
    unknown,
    CreateUserInput
  >({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    defaultValues: { name: '', login: '', password: '', roleId: roles[0]?.id ?? '', active: true },
  });

  const submit = handleSubmit((input) =>
    create.mutate(input, {
      onSuccess: () => {
        toast('Usuário criado');
        onClose();
      },
    }),
  );

  return (
    <Modal title="Novo usuário" onClose={onClose} width={420}>
      <form onSubmit={submit} className="flex flex-col gap-2.5">
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
            {roles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex gap-2 justify-end">
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!formState.isValid || create.isPending}>
            Criar
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function RoleModal({ onClose }: { onClose: () => void }) {
  const create = useCreateRole();
  const { register, handleSubmit, watch, setValue, formState } = useForm<RoleInput>({
    resolver: zodResolver(roleSchema),
    mode: 'onChange',
    defaultValues: { name: '', permissions: [] },
  });
  const permissions = watch('permissions');

  const toggle = (permission: Permission, on: boolean) =>
    setValue(
      'permissions',
      on ? [...permissions, permission] : permissions.filter((p) => p !== permission),
      { shouldValidate: true },
    );

  const submit = handleSubmit((input) =>
    create.mutate(input, {
      onSuccess: () => {
        toast('Perfil criado');
        onClose();
      },
    }),
  );

  return (
    <Modal title="Novo perfil" onClose={onClose} width={460}>
      <form onSubmit={submit}>
        <div className="s-label">Nome do perfil</div>
        <div className="s-input mb-3">
          <input autoFocus data-testid="role-name" placeholder="ex.: Caixa" {...register('name')} />
        </div>
        <div className="s-label">Permissões</div>
        <div className="flex flex-col gap-1.5 max-h-[280px] overflow-auto">
          {ALL_PERMISSIONS.map((permission) => (
            <label key={permission} className="flex items-center gap-2 text-[13.5px]">
              <Checkbox
                on={permissions.includes(permission)}
                onChange={(on) => toggle(permission, on)}
              />
              {PERMISSION_LABELS[permission]}
            </label>
          ))}
        </div>
        <ModalActions>
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!formState.isValid || create.isPending}>
            Criar perfil
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
