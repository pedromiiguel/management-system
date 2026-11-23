import { createFileRoute, redirect } from '@tanstack/react-router';
import { getSession } from '@modules/auth/main/session';
import { HOME_PATH, LOGIN_PATH } from '@presentation/constants/navigation';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: getSession() ? HOME_PATH : LOGIN_PATH });
  },
});
