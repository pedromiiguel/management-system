import { z } from 'zod';
import { dateOnlyKey, STORE_TIME_ZONE, storeDateKey } from '@beverage/shared';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal2 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number | null | undefined): string {
  return brl.format(value ?? 0);
}

/**
 * "R$ 1.234,56" com espaço comum depois do "R$", para texto puro (cupom): o
 * `formatBRL` usa NBSP, que a impressora não alinha.
 */
export function formatBRLText(value: number): string {
  return `R$ ${decimal2.format(value)}`;
}

/** "1.234,56" — sem símbolo de moeda. */
export function formatDecimal(value: number): string {
  return decimal2.format(value);
}

/*
 * Datas seguem a regra única do shared (time.ts): instantes são mostrados no
 * fuso da loja; datas sem hora (vencimento, validade) e períodos são chaves
 * `AAAA-MM-DD` do dia da loja, sem conversão de fuso.
 */

/** Instante (venda, movimento) como "09/11, 14:30" no fuso da loja. */
export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', {
    timeZone: STORE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Dia da loja em que caiu um instante, como "09/11/2026". */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return formatDateKey(storeDateKey(new Date(value)));
}

/** Data sem hora (vencimento, validade) como "09/11/2026", sem deslocar pelo fuso. */
export function formatDateOnly(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return formatDateKey(dateOnlyKey(value));
}

/** `AAAA-MM-DD` → "DD/MM/AAAA". */
export function formatDateKey(ymd: string): string {
  const [year, month, day] = ymd.split('-');
  return `${day}/${month}/${year}`;
}

/** Hoje, no dia da loja (`AAAA-MM-DD`, o formato dos inputs type=date). */
export function todayKey(): string {
  return storeDateKey(new Date());
}

/** Período padrão das telas de relatório/fluxo: do dia 1º do mês da loja até hoje. */
export function monthToDate(today = todayKey()): { from: string; to: string } {
  return { from: `${today.slice(0, 8)}01`, to: today };
}

/** Aceita "12,50", "12.50", "R$ 1.234,56". Texto inválido vira NaN; vazio vira 0. */
export function parseMoney(raw: string): number {
  const cleaned = raw
    .trim()
    .replace(/[R$\s]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  const value = Number(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) / 100 : NaN;
}

/**
 * Campo de formulário digitado como texto ("12,50") e validado pela regra
 * numérica do shared: `moneyText(payableSchema.shape.amount)`.
 */
export function moneyText<T extends z.ZodType<number, number>>(rule: T) {
  return z.string().transform(parseMoney).pipe(rule);
}

/** Campo de texto opcional: vazio vira `undefined` (não é enviado). */
export const optionalText = z.string().transform((value) => value || undefined);

/** Máscara para inputs de moeda: digita "1250" → "12,50", "123456" → "1.234,56". */
export function maskBRL(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '';
  return decimal2.format(Number(digits) / 100);
}
