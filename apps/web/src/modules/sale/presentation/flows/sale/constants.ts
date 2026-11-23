import { PaymentMethod } from '@beverage/shared';

/**
 * Atalhos do PDV (FR-26): a mesma tabela registra a tecla, rotula botões e
 * modais e monta a faixa de ajuda. `hint` = aparece na faixa.
 */
export const SALE_HOTKEYS = {
  search: { key: 'F2', label: 'F2', hint: 'buscar' },
  discount: { key: 'F4', label: 'F4', hint: 'desconto' },
  remove: { key: 'Delete', label: 'Del', hint: 'remover' },
  finalize: { key: 'F10', label: 'F10', hint: 'finalizar' },
  cancel: { key: 'Escape', label: 'Esc', hint: 'cancelar' },
  cash: { key: 'F5', label: 'F5' },
  pix: { key: 'F6', label: 'F6' },
  card: { key: 'F7', label: 'F7' },
  customer: { key: 'F8', label: 'F8' },
} as const;

/** Blocos de forma de pagamento, na ordem da tela. */
export const PAYMENT_TILES = [
  { method: PaymentMethod.CASH, label: 'Dinheiro', hotkey: SALE_HOTKEYS.cash },
  { method: PaymentMethod.PIX, label: 'PIX', hotkey: SALE_HOTKEYS.pix },
  { method: PaymentMethod.CARD, label: 'Cartão', hotkey: SALE_HOTKEYS.card },
  { method: PaymentMethod.CREDIT, label: 'Fiado', hotkey: SALE_HOTKEYS.customer },
] as const;

/** Espera sem novos cliques antes de enviar uma quantidade alterada. */
export const QUANTITY_DEBOUNCE_MS = 400;

export const SALE_CANCELLED_MESSAGE = 'Venda cancelada';
export const EMPTY_SALE_MESSAGE = 'Adicione itens antes de finalizar';
export const PAYMENT_DISABLED_MESSAGE = 'Forma de pagamento desligada nas Configurações';
export const CASH_MISSING_MESSAGE = 'Informe o valor recebido (maior ou igual ao total)';
export const UNEXPECTED_ERROR_MESSAGE = 'Erro inesperado — tente novamente';
