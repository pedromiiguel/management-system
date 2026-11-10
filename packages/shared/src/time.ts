/**
 * "Um dia" é sempre o dia civil da loja, não o do navegador, do servidor nem
 * UTC. Relatórios, histórico, fluxo de caixa, painel e as telas usam estas
 * funções para cortar períodos e saber que dia é hoje.
 *
 * Dois tipos de data:
 * - Instante (vendas, movimentos): um `Date`; o dia dele é `storeDateKey`.
 * - Data sem hora (vencimento, validade): o dia civil `AAAA-MM-DD`, enviado
 *   assim e gravado como meia-noite UTC; lido de volta com `dateOnlyKey`, sem
 *   conversão de fuso. Comparações usam as chaves `AAAA-MM-DD`.
 */
export const STORE_TIME_ZONE = 'America/Sao_Paulo';

const DAY_MS = 24 * 60 * 60 * 1000;
const YMD = /^(\d{4})-(\d{2})-(\d{2})$/;

const partsFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: STORE_TIME_ZONE,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function storeParts(instant: Date) {
  const parts: Record<string, number> = {};
  for (const p of partsFormatter.formatToParts(instant)) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  return parts as Record<'year' | 'month' | 'day' | 'hour' | 'minute' | 'second', number>;
}

/** Diferença (ms) entre o relógio da loja e UTC naquele instante. */
function storeOffsetMs(instant: Date): number {
  const p = storeParts(instant);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

/** Instante em que começa o dia civil `YYYY-MM-DD` na loja. */
export function startOfStoreDay(ymd: string): Date {
  const wallClock = keyToUtc(ymd);
  // Duas passadas acertam o offset mesmo se o dia tiver mudança de horário.
  let instant = wallClock - storeOffsetMs(new Date(wallClock));
  instant = wallClock - storeOffsetMs(new Date(instant));
  return new Date(instant);
}

/** Último milissegundo do dia civil `YYYY-MM-DD` na loja. */
export function endOfStoreDay(ymd: string): Date {
  const next = new Date(startOfStoreDay(ymd).getTime() + DAY_MS + 2 * 60 * 60 * 1000);
  return new Date(startOfStoreDay(storeDateKey(next)).getTime() - 1);
}

/** Dia civil da loja (`YYYY-MM-DD`) em que cai o instante. */
export function storeDateKey(instant: Date): string {
  const p = storeParts(instant);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Início do dia, do mês e do ano-calendário (BR-02) da loja que contêm `now`. */
export function storeCalendarStarts(now: Date) {
  const today = storeDateKey(now);
  const [year, month] = today.split('-');
  return {
    day: startOfStoreDay(today),
    month: startOfStoreDay(`${year}-${month}-01`),
    year: startOfStoreDay(`${year}-01-01`),
  };
}

/** O dia `AAAA-MM-DD` de uma data sem hora (vencimento, validade), como foi gravado. */
export function dateOnlyKey(value: string | Date): string {
  return (typeof value === 'string' ? value : value.toISOString()).slice(0, 10);
}

/** `AAAA-MM-DD` deslocado em `days` dias civis. */
export function addDaysToKey(ymd: string, days: number): string {
  return new Date(keyToUtc(ymd) + days * DAY_MS).toISOString().slice(0, 10);
}

/** Dias civis de `from` até `to` (negativo se `to` vem antes). */
export function daysBetweenKeys(from: string, to: string): number {
  return Math.round((keyToUtc(to) - keyToUtc(from)) / DAY_MS);
}

/** Os últimos `count` meses da loja (`AAAA-MM`), terminando no mês de `now`. */
export function storeMonthKeys(now: Date, count: number): string[] {
  const [year, month] = storeDateKey(now).split('-').map(Number) as [number, number];
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1));
    return d.toISOString().slice(0, 7);
  });
}

function keyToUtc(ymd: string): number {
  const match = YMD.exec(ymd);
  if (!match) throw new Error(`Data inválida (esperado AAAA-MM-DD): ${ymd}`);
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}
