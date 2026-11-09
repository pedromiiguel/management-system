import { DiscountType } from './enums';

/** Código curto da Venda mostrado ao operador, no cupom e nos lançamentos. */
export function saleCode(saleId: string): string {
  return saleId.slice(-6).toUpperCase();
}

/** Taxa de serviço: percentual sobre o subtotal (pré-desconto). Ver CONTEXT.md. */
export const SERVICE_FEE_PERCENT = 10;
export const SERVICE_FEE_LABEL = `Taxa de serviço (${SERVICE_FEE_PERCENT}%)`;

export interface SalePricingInput {
  items: readonly { unitPrice: number; quantity: number }[];
  discount?: { type: DiscountType; value: number } | null;
  serviceFee?: boolean;
  /** Valor recebido (dinheiro). Sem ele, não há troco. */
  amountPaid?: number | null;
}

export interface SalePricing {
  /** Σ preço × quantidade. */
  subtotal: number;
  /** Quanto o desconto efetivamente abateu (nunca passa do subtotal). */
  discount: number;
  /** Taxa de serviço, ou null quando desligada. */
  serviceFee: number | null;
  /** Valor devido: subtotal − desconto + taxa de serviço. */
  total: number;
  /** amountPaid − total, ou null sem valor recebido. Negativo = falta dinheiro. */
  change: number | null;
}

/**
 * Precificação da Venda — uma regra só para o servidor (fonte da verdade) e
 * para a prévia do PDV. Valores entram e saem em reais com 2 casas, mas toda a
 * conta é feita em centavos inteiros, então não há erro de float: o servidor
 * converte Decimal → número e de volta sem perder nada.
 *
 * - Desconto em valor ou percentual sobre o subtotal, limitado ao subtotal.
 * - Taxa de serviço: SERVICE_FEE_PERCENT do subtotal pré-desconto, somada depois do desconto.
 * - Arredondamento: meio para cima, no centavo.
 */
export function priceSale(input: SalePricingInput): SalePricing {
  const subtotal = input.items.reduce((acc, i) => acc + toCents(i.unitPrice) * i.quantity, 0);

  let discount = 0;
  if (input.discount) {
    discount =
      input.discount.type === DiscountType.AMOUNT
        ? toCents(input.discount.value)
        : subtotal - divRoundHalfUp(subtotal * (10_000 - toCents(input.discount.value)), 10_000);
    discount = Math.min(Math.max(discount, 0), subtotal);
  }

  const serviceFee = input.serviceFee ? divRoundHalfUp(subtotal * SERVICE_FEE_PERCENT, 100) : null;
  const total = subtotal - discount + (serviceFee ?? 0);
  const change =
    input.amountPaid === undefined || input.amountPaid === null
      ? null
      : toCents(input.amountPaid) - total;

  return {
    subtotal: fromCents(subtotal),
    discount: fromCents(discount),
    serviceFee: serviceFee === null ? null : fromCents(serviceFee),
    total: fromCents(total),
    change: change === null ? null : fromCents(change),
  };
}

function toCents(reais: number): number {
  return Math.round(reais * 100);
}

function fromCents(cents: number): number {
  return cents / 100;
}

/** n / d arredondado meio-para-cima, em inteiros (n ≥ 0, d > 0). */
function divRoundHalfUp(n: number, d: number): number {
  return Math.floor((2 * n + d) / (2 * d));
}
