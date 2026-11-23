import { priceSale, type SalePricing } from '@beverage/shared';
import type { ISale } from './sale-model';

/**
 * `priceSale` (a mesma regra do servidor) aplicado à Venda como o servidor a
 * guarda: itens, desconto e Taxa de serviço (`serviceFee` não nulo = ligada).
 * Serve para o que a Venda não persiste — o desconto em R$ e o troco de um
 * valor recebido ainda não enviado. O total exibido é sempre `sale.total`.
 */
export function salePricing(
  sale: Pick<ISale, 'items' | 'discountType' | 'discountValue' | 'serviceFee'>,
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
