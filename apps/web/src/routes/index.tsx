import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession, HOME_PATH } from '@/lib/session';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: getSession() ? HOME_PATH : '/login' });
  },
});
