import { Barcode, Boxes, CircleDollarSign, type LucideIcon } from 'lucide-react';

/** Emblema da marca. Arquivo entregue fora do repo — ver Decisão 5 do ADR 0013. */
export const BRAND_LOGO_SRC = '/logo.png';
export const BRAND_NAME = "Costas's Espetos";

export const BRAND_FEATURES: { icon: LucideIcon; label: string }[] = [
  { icon: Barcode, label: 'Caixa rápido, leitura por código de barras' },
  { icon: Boxes, label: 'Estoque baixado a cada venda' },
  { icon: CircleDollarSign, label: 'Fechamento do dia sem planilha' },
];

export const BRAND_VERSION = 'v1.0 · MVP';
