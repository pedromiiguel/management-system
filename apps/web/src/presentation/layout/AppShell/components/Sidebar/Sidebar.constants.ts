import type { IconName } from '@/components/sol';

export const NAV: { icon: IconName; label: string; to: string }[] = [
  { icon: 'pdv', label: 'PDV — Caixa', to: '/sale' },
  { icon: 'produtos', label: 'Produtos', to: '/products' },
  { icon: 'estoque', label: 'Estoque', to: '/stock' },
  { icon: 'financeiro', label: 'Financeiro', to: '/financial' },
  { icon: 'relatorios', label: 'Relatórios', to: '/reports' },
  { icon: 'config', label: 'Configurações', to: '/settings' },
];
