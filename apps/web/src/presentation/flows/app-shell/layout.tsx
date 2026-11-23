import { Link, Outlet } from '@tanstack/react-router';
import { NAV, UNKNOWN_USER_INITIAL, UNKNOWN_USER_NAME } from './constants';
import type { TAppShellLayoutProps } from './types';

const ACTIVE_NAV_PROPS = { className: 's-nav-item is-active' };

export function AppShellLayout({ userName, onLogoutClick }: TAppShellLayoutProps) {
  const userInitial = userName?.charAt(0).toUpperCase() ?? UNKNOWN_USER_INITIAL;

  return (
    <div className="s-screen">
      <div className="s-sidebar">
        <div className="s-logo">
          <span className="s-logo-mark">
            {/* Recorte do logo.png: o emblema inteiro só é legível a 196px. */}
            <img src="/logo-mark.png" alt="" />
          </span>
          <span className="s-logo-text">
            Costa&apos;s
            <b>ESPETOS</b>
          </span>
        </div>
        <nav className="s-nav">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="s-nav-item" activeProps={ACTIVE_NAV_PROPS}>
              <item.icon size={17} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="s-side-foot">
          <span className="s-avatar">{userInitial}</span>
          <span>
            <span className="s-side-user">{userName ?? UNKNOWN_USER_NAME}</span>
            <button className="s-side-out" onClick={onLogoutClick}>
              sair
            </button>
          </span>
        </div>
      </div>
      <div className="s-main">
        <Outlet />
      </div>
    </div>
  );
}
