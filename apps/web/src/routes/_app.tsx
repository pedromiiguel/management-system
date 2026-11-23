import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppShellFlow } from '@presentation/flows/app-shell';
import { queryClient } from '@main/query/query-client';
import { sessionQuery } from '@modules/auth/main/auth-queries';
import { getSession } from '@modules/auth/main/session';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    if (!getSession()) throw redirect({ to: '/login', search: { redirect: location.href } });
    // Permissões vivas antes da primeira tela. Um 401 já leva ao login; outra
    // falha vira aviso (QueryCache) e a sessão guardada segue valendo.
    await queryClient.ensureQueryData(sessionQuery()).catch(() => undefined);
  },
  component: AppShellFlow,
});
