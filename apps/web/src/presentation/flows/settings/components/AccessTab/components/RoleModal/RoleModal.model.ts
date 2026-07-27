import { useState } from 'react';
import { useToast } from '@/presentation/components/Toast';
import { apiErrorMessage } from '@/lib/api';
import { useCreateRoleMutation } from '@/main/factories/mutations/users';

export function useRoleModalModel(onDone: () => void) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [permissions, setPermissions] = useState<string[]>([]);

  const togglePermission = (permission: string, on: boolean) => {
    setPermissions((prev) => (on ? [...prev, permission] : prev.filter((p) => p !== permission)));
  };

  const save = useCreateRoleMutation();

  const submit = () => {
    save.mutate(
      { name, permissions },
      {
        onSuccess: () => {
          toast('Perfil criado');
          onDone();
        },
        onError: (error) => toast(apiErrorMessage(error), 'danger'),
      },
    );
  };

  const valid = name.trim().length > 0 && permissions.length > 0;

  return { name, setName, permissions, togglePermission, valid, saving: save.isPending, submit };
}
