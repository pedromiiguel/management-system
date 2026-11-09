import { MutationCache, QueryClient } from '@tanstack/react-query';
import { toast } from '@/components/Toast';

declare module '@tanstack/react-query' {
  interface Register {
    /** `toastError: false` quando a própria tela mostra o erro. */
    mutationMeta: { toastError?: boolean };
  }
}

function isClientError(error: unknown): boolean {
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' && status >= 400 && status < 500;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failures, error) => !isClientError(error) && failures < 1,
      refetchOnWindowFocus: false,
      staleTime: 15_000,
    },
  },
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.toastError === false) return;
      toast(error.message, 'danger');
    },
  }),
});
