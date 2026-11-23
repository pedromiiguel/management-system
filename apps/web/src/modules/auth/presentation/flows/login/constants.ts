import { Barcode, Boxes, CircleDollarSign } from 'lucide-react';

export const BRAND_NAME = "Costa's Espetos";

export const BRAND_FEATURES = [
  { icon: Barcode, label: 'Caixa rápido, leitura por código de barras' },
  { icon: Boxes, label: 'Estoque baixado a cada venda' },
  { icon: CircleDollarSign, label: 'Fechamento do dia sem planilha' },
];

export const SUBMIT_LABEL_BY_PENDING = { true: 'Entrando…', false: 'Entrar' } as const;
export const PASSWORD_TOGGLE_LABEL_BY_VISIBLE = {
  true: 'Ocultar senha',
  false: 'Mostrar senha',
} as const;
