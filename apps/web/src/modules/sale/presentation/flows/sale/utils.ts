import { DiscountType } from '@beverage/shared';
import { formatBRL } from '@presentation/utils/format';
import type { ISale, TAddSaleItemInput } from '@modules/sale/domain/sale-model';
import { UNEXPECTED_ERROR_MESSAGE } from './constants';

/** Campo de código: "3*7891…" ou "3x7891…" bipa 3 unidades (atalho do balcão). */
export function parseScan(raw: string): TAddSaleItemInput | null {
  const code = raw.trim();
  if (!code) return null;
  const match = /^(\d{1,3})[*xX](.+)$/.exec(code);
  return match ? { code: match[2]!.trim(), quantity: Number(match[1]) } : { code };
}

/** Desconto como aparece no card: "10%", "R$ 5,00" ou "—". */
export function discountLabel(sale: ISale | null): string {
  if (!sale?.discountValue) return '—';
  return sale.discountType === DiscountType.PERCENT
    ? `${sale.discountValue}%`
    : formatBRL(sale.discountValue);
}

export function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : UNEXPECTED_ERROR_MESSAGE;
}
