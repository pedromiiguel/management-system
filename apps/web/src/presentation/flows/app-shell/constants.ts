import {
  Barcode,
  Boxes,
  ChartColumn,
  CircleDollarSign,
  Package,
  SlidersHorizontal,
} from 'lucide-react';
import type { TNavItem } from './types';

export const NAV: TNavItem[] = [
  { icon: Barcode, label: 'PDV — Caixa', to: '/sale' },
  { icon: Package, label: 'Produtos', to: '/products' },
  { icon: Boxes, label: 'Estoque', to: '/stock' },
  { icon: CircleDollarSign, label: 'Financeiro', to: '/financial' },
  { icon: ChartColumn, label: 'Relatórios', to: '/reports' },
  { icon: SlidersHorizontal, label: 'Configurações', to: '/settings' },
];

export const UNKNOWN_USER_NAME = '—';
export const UNKNOWN_USER_INITIAL = '?';
