import {
  Barcode,
  Boxes,
  ChartColumn,
  CircleDollarSign,
  Package,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

export const NAV: { icon: LucideIcon; label: string; to: string }[] = [
  { icon: Barcode, label: 'PDV — Caixa', to: '/sale' },
  { icon: Package, label: 'Produtos', to: '/products' },
  { icon: Boxes, label: 'Estoque', to: '/stock' },
  { icon: CircleDollarSign, label: 'Financeiro', to: '/financial' },
  { icon: ChartColumn, label: 'Relatórios', to: '/reports' },
  { icon: SlidersHorizontal, label: 'Configurações', to: '/settings' },
];
