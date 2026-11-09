import { PaymentMethod, SERVICE_FEE_RATE } from '@beverage/shared';
import type { AddSaleItemInput, Sale } from './api';

/** Código curto da venda exibido ao operador e no cupom: "#A1B2C3". */
export function saleCode(saleId: string): string {
  return saleId.slice(-6).toUpperCase();
}

/** "10%" — rótulo da Taxa de serviço, derivado da taxa do shared. */
export const SERVICE_FEE_LABEL = `${Math.round(SERVICE_FEE_RATE * 100)}%`;

/** Desconto em R$ efetivamente aplicado (cobre valor e percentual). */
export function discountAmount(sale: Pick<Sale, 'subtotal' | 'total' | 'serviceFee'>): number {
  return sale.subtotal - (sale.total - (sale.serviceFee ?? 0));
}

/**
 * Prévia do checkout no PDV. O servidor recalcula tudo em Decimal na
 * conclusão; aqui só se mostra o que será cobrado.
 */
export function previewCheckout(
  sale: Pick<Sale, 'items' | 'total'> | null,
  options: { serviceFee: boolean; payment: PaymentMethod; received: number },
) {
  const items = sale?.items ?? [];
  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const fee = options.serviceFee ? Math.round(subtotal * SERVICE_FEE_RATE * 100) / 100 : 0;
  const total = (sale?.total ?? 0) + fee;
  const change =
    options.payment === PaymentMethod.CASH && Number.isFinite(options.received)
      ? options.received - total
      : null;
  return {
    fee,
    total,
    change,
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
    productCount: items.length,
  };
}

/** Campo de código: "3*7891…" ou "3x7891…" bipa 3 unidades (atalho do balcão). */
export function parseScan(raw: string): AddSaleItemInput | null {
  const code = raw.trim();
  if (!code) return null;
  const match = /^(\d{1,3})[*xX](.+)$/.exec(code);
  return match ? { code: match[2]!.trim(), quantity: Number(match[1]) } : { code };
}
