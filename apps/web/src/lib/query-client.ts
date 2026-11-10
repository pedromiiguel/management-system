import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { toast } from './toast';

declare module '@tanstack/react-query' {
  interface Register {
    /** `toastError: false` quando a própria tela mostra o erro. */
    mutationMeta: { toastError?: boolean };
  }
}

function statusOf(error: unknown): number | null {
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' ? status : null;
}

function isClientError(error: unknown): boolean {
  const status = statusOf(error);
  return status !== null && status >= 400 && status < 500;
}

/** 401 já leva ao login (lib/http) — não vale um aviso a mais. */
const isUnauthorized = (error: unknown) => statusOf(error) === 401;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failures, error) => !isClientError(error) && failures < 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
  // Toda consulta ou ação que falha avisa o usuário (uma vez por falha).
  queryCache: new QueryCache({
    onError: (error) => {
      if (!isUnauthorized(error)) toast(error.message, 'danger');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.toastError === false || isUnauthorized(error)) return;
      toast(error.message, 'danger');
    },
  }),
});
