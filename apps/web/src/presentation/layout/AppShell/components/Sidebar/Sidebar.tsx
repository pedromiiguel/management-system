import { useSidebarModel } from './Sidebar.model';
import { SidebarView } from './Sidebar.view';

export function Sidebar() {
  const { user, logout } = useSidebarModel();

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? '?';
  const userName = user?.name ?? '—';

  return <SidebarView userInitial={userInitial} userName={userName} onLogout={logout} />;
}
