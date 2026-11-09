import { createFileRoute, redirect } from '@tanstack/react-router';
import { AppShell } from '@/components/AppShell';
import { queryClient } from '@/lib/query-client';
import { getSession } from '@/lib/session';
import { sessionQuery } from '@/lib/session-query';

export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ location }) => {
    if (!getSession()) throw redirect({ to: '/login', search: { redirect: location.href } });
    // Permissões vivas antes da primeira tela. Um 401 já leva ao login; outra
    // falha vira aviso (QueryCache) e a sessão guardada segue valendo.
    await queryClient.ensureQueryData(sessionQuery()).catch(() => undefined);
  },
  component: AppShell,
});
