import { useQueryClient } from '@tanstack/react-query';

/**
 * Raiz da chave de cache de cada recurso da API. Cada feature monta suas
 * chaves a partir daqui; uma mutation invalida as raízes que o efeito dela
 * no servidor atinge, sem importar a feature dona do recurso.
 */
export const rootKeys = {
  products: ['products'],
  stock: ['stock'],
  sales: ['sales'],
  customers: ['customers'],
  cashRegister: ['cash-register'],
  financial: ['financial'],
  receivables: ['receivables'],
  payables: ['payables'],
  reports: ['reports'],
  settings: ['settings'],
  users: ['users'],
  roles: ['roles'],
  /** Usuário logado e permissões vivas (`/auth/me`). */
  session: ['session'],
} as const;

export type Resource = keyof typeof rootKeys;

/** `onSuccess` de mutation que invalida os recursos afetados. */
export function useInvalidate(...resources: Resource[]) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all(
      resources.map((resource) => queryClient.invalidateQueries({ queryKey: rootKeys[resource] })),
    );
}
