import { Link } from '@tanstack/react-router';
import { SolIcon } from '@/components/sol';
import { NAV } from './Sidebar.constants';
import type { SidebarViewProps } from './Sidebar.types';

export function SidebarView({ userInitial, userName, onLogout }: SidebarViewProps) {
  return (
    <div className="s-sidebar">
      <div className="s-logo">
        <span className="s-logo-mark">
          <SolIcon name="sun" size={20} />
        </span>
        <span className="s-logo-text">
          Costas
          <br />
          <b>BAR</b>
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
            <SolIcon name={item.icon} />
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
