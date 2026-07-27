import { createFileRoute, redirect } from '@tanstack/react-router';
import { isAuthenticated } from '../lib/auth';
import { AppShell } from '../presentation/layout/AppShell';

export const Route = createFileRoute('/_app')({
  beforeLoad: ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }
  },
  component: AppShell,
});
