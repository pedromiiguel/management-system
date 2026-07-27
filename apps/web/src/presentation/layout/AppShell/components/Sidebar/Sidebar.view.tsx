import { Link } from '@tanstack/react-router';
import { NAV } from './Sidebar.constants';
import type { SidebarViewProps } from './Sidebar.types';

export function SidebarView({ userInitial, userName, onLogout }: SidebarViewProps) {
  return (
    <div className="s-sidebar">
      <div className="s-logo">
        {/* Lockup tipográfico: o emblema circular da marca só é legível a 196px,
            então fica restrito ao login — ver Decisão 5 do ADR 0013. */}
        <span className="s-logo-text">
          Costas&apos;s
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
