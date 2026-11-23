import { useQuery } from '@tanstack/react-query';
import { sessionQuery } from '@modules/auth/main/auth-queries';
import { logout, useSession } from '@modules/auth/main/session';
import { AppShellLayout } from './layout';

export function AppShellController() {
  // Mantém a sessão em dia: refaz `/auth/me` quando invalidada (ex.: papel alterado).
  useQuery(sessionQuery());
  const userName = useSession()?.user.name ?? null;
  return <AppShellLayout userName={userName} onLogoutClick={logout} />;
}
