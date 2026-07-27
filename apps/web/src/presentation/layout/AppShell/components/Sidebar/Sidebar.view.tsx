import { Link } from '@tanstack/react-router';
import { LOGO_MARK_SRC, NAV } from './Sidebar.constants';
import type { SidebarViewProps } from './Sidebar.types';

export function SidebarView({ userInitial, userName, onLogout }: SidebarViewProps) {
  return (
    <div className="s-sidebar">
      <div className="s-logo">
        <span className="s-logo-mark">
          <img src={LOGO_MARK_SRC} alt="" />
        </span>
        <span className="s-logo-text">
          Costa&apos;s
          <b>ESPETOS</b>
        </span>
      </div>
      <nav className="s-nav">
        {NAV.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="s-nav-item"
            activeProps={{ className: 's-nav-item is-active' }}
          >
            <item.icon size={17} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="s-side-foot">
        <span className="s-avatar">{userInitial}</span>
        <span>
          <span className="s-side-user">{userName}</span>
          <button className="s-side-out" onClick={onLogout}>
            sair
          </button>
        </span>
      </div>
    </div>
  );
}
