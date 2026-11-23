/** Envelope das listagens paginadas da API. */
export interface IPaginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
}
