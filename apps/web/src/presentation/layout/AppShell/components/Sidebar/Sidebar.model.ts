import { useNavigate } from '@tanstack/react-router';
import { clearSession, getUser } from '@/lib/auth';

export function useSidebarModel() {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    clearSession();
    void navigate({ to: '/login' });
  };

  return { user, logout };
}
