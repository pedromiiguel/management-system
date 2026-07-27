/** Movido de `domain/usecases/financial` — cumpre o desvio deliberado da ADR 0006 (ver ADR 0009). */
export interface IGetSalesTotal {
  get: (from: string, to: string) => Promise<{ total: number }>;
}
