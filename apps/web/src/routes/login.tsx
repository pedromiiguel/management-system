import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { LoginFlow } from '@modules/auth/presentation/flows/login';
import { getSession } from '@modules/auth/main/session';
import { HOME_PATH } from '@presentation/constants/navigation';

export const Route = createFileRoute('/login')({
  validateSearch: z.object({ redirect: z.string().optional() }),
  beforeLoad: () => {
    if (getSession()) throw redirect({ to: HOME_PATH });
  },
  component: LoginFlow,
});
