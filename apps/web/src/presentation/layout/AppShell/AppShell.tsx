import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './components/Sidebar';

export function AppShell() {
  return (
    <div className="s-screen">
      <Sidebar />
      <div className="s-main">
        <Outlet />
      </div>
    </div>
  );
}
