import {
  Barcode,
  Boxes,
  ChartColumn,
  CircleDollarSign,
  Package,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

/** Recorte do logo.png (grelha + espetinhos) — o emblema inteiro só é legível
 * a 196px; ver Decisão 5 do ADR 0013. */
export const LOGO_MARK_SRC = '/logo-mark.png';

export const NAV: { icon: LucideIcon; label: string; to: string }[] = [
  { icon: Barcode, label: 'PDV — Caixa', to: '/sale' },
  { icon: Package, label: 'Produtos', to: '/products' },
  { icon: Boxes, label: 'Estoque', to: '/stock' },
  { icon: CircleDollarSign, label: 'Financeiro', to: '/financial' },
  { icon: ChartColumn, label: 'Relatórios', to: '/reports' },
  { icon: SlidersHorizontal, label: 'Configurações', to: '/settings' },
];
