import type { IProductPerformance } from '../../../domain/report-model';

/** Mais vendidos vêm ordenados da API; a aba de margem reordena pela maior margem. */
export function sortRows(rows: IProductPerformance[], sortByMargin: boolean) {
  return sortByMargin ? [...rows].sort((a, b) => b.margin - a.margin) : rows;
}
