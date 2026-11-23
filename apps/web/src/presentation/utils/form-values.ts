/**
 * `setValueAs` de campos opcionais: vazio vira `undefined` (o campo não vai à API).
 * Datas AAAA-MM-DD vão como estão: data sem hora (ver `format.ts`).
 */
export const emptyToUndefined = (value: string) => value || undefined;

export const emptyToUndefinedNumber = (value: string) => (value === '' ? undefined : Number(value));
