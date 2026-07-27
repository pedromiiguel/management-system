import { useState } from 'react';
import { useToast } from '@/components/sol';
import type { Role } from '@/domain/models/users';
import { apiErrorMessage } from '@/lib/api';
import { useCreateUserMutation } from '@/main/factories/mutations/users';

export function useUserModalModel(roles: Role[], onDone: () => void) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState(roles[0]?.id ?? '');

  const valid = name.trim().length > 0 && login.trim().length >= 3 && password.length >= 6 && roleId.length > 0;

  const save = useCreateUserMutation();

  const submit = () => {
    save.mutate(
      { name, login, password, roleId, active: true },
      {
        onSuccess: () => {
          toast('Usuário criado');
          onDone();
        },
        onError: (error) => toast(apiErrorMessage(error), 'danger'),
      },
    );
  };

  return {
    name,
    setName,
    login,
    setLogin,
    password,
    setPassword,
    roleId,
    setRoleId,
    valid,
    saving: save.isPending,
    submit,
  };
}
