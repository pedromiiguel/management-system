import { createFileRoute, redirect } from '@tanstack/react-router';
import { z } from 'zod';
import { isAuthenticated } from '../lib/auth';
import { LoginPage } from '../presentation/flows/login/LoginPage';

const loginSearchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute('/login')({
  validateSearch: loginSearchSchema,
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: '/sale' });
  },
  component: LoginPage,
});
