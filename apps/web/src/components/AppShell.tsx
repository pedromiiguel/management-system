import { useQuery } from '@tanstack/react-query';
import { Link, Outlet, type LinkProps } from '@tanstack/react-router';
import {
  Barcode,
  Boxes,
  ChartColumn,
  CircleDollarSign,
  Package,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { logout, useSession } from '@/lib/session';
import { sessionQuery } from '@/lib/session-query';

const NAV: { icon: LucideIcon; label: string; to: LinkProps['to'] }[] = [
  { icon: Barcode, label: 'PDV — Caixa', to: '/sale' },
  { icon: Package, label: 'Produtos', to: '/products' },
  { icon: Boxes, label: 'Estoque', to: '/stock' },
  { icon: CircleDollarSign, label: 'Financeiro', to: '/financial' },
  { icon: ChartColumn, label: 'Relatórios', to: '/reports' },
  { icon: SlidersHorizontal, label: 'Configurações', to: '/settings' },
];

export function AppShell() {
  // Mantém a sessão em dia: refaz `/auth/me` quando invalidada (ex.: papel alterado).
  useQuery(sessionQuery());
  return (
    <div className="s-screen">
      <Sidebar />
      <div className="s-main">
        <Outlet />
      </div>
    </div>
  );
}

function Sidebar() {
  const user = useSession()?.user;
  return (
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
        <span className="s-avatar">{user?.name.charAt(0).toUpperCase() ?? '?'}</span>
        <span>
          <span className="s-side-user">{user?.name ?? '—'}</span>
          <button className="s-side-out" onClick={logout}>
            sair
          </button>
        </span>
      </div>
    </div>
  );
}
