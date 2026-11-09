import { z } from 'zod';

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const decimal2 = new Intl.NumberFormat('pt-BR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatBRL(value: number | null | undefined): string {
  return brl.format(value ?? 0);
}

/** "1.234,56" — sem símbolo de moeda. */
export function formatDecimal(value: number): string {
  return decimal2.format(value);
}

export function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR');
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

/** yyyy-mm-dd local (para inputs type=date). */
export function toDateInput(date: Date): string {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

/** Período padrão das telas de relatório/fluxo: do dia 1º do mês até hoje. */
export function monthToDate(today = new Date()): { from: string; to: string } {
  return {
    from: toDateInput(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInput(today),
  };
}

/** Fim do dia para filtros `to` que a API compara com timestamp. */
export function endOfDay(date: string): string {
  return `${date}T23:59:59`;
}
