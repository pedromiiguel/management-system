import { priceSale, type SalePricing } from '@beverage/shared';
import type { AddSaleItemInput, Sale } from './api';

/**
 * `priceSale` (a mesma regra do servidor) aplicado à Venda como o servidor a
 * guarda: itens, desconto e Taxa de serviço (`serviceFee` não nulo = ligada).
 * Serve para o que a Venda não persiste — o desconto em R$ e o troco de um
 * valor recebido ainda não enviado. O total exibido é sempre `sale.total`.
 */
export function salePricing(
  sale: Pick<Sale, 'items' | 'discountType' | 'discountValue' | 'serviceFee'>,
  amountPaid?: number | null,
): SalePricing {
  return priceSale({
    items: sale.items,
    discount:
      sale.discountType && sale.discountValue !== null
        ? { type: sale.discountType, value: sale.discountValue }
        : null,
    serviceFee: sale.serviceFee !== null,
    amountPaid,
  });
}

/** Campo de código: "3*7891…" ou "3x7891…" bipa 3 unidades (atalho do balcão). */
export function parseScan(raw: string): AddSaleItemInput | null {
  const code = raw.trim();
  if (!code) return null;
  const match = /^(\d{1,3})[*xX](.+)$/.exec(code);
  return match ? { code: match[2]!.trim(), quantity: Number(match[1]) } : { code };
}
