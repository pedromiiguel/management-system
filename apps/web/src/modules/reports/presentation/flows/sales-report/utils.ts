import type { ISalesReport } from '../../../domain/report-model';

/** Ticket médio: Receita ÷ vendas concluídas; zero sem vendas. */
export function averageTicket(report: ISalesReport | undefined): number {
  return report && report.count > 0 ? report.revenue / report.count : 0;
}

/** Peças vendidas numa venda (soma das quantidades dos itens). */
export function itemCount(items: { quantity: number }[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}
