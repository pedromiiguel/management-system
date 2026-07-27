export interface SalesReportDay {
  day: string;
  count: number;
  total: number;
}

export interface SalesReport {
  days: SalesReportDay[];
  count: number;
  /** Receita líquida de taxa de serviço (só produtos) — ver ADR 0002. */
  total: number;
  serviceFeeTotal: number;
}

export interface ProductPerformance {
  product: { id: string; name: string; sku: string; unit: string } | null;
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number;
}

export interface StockPositionRow {
  id: string;
  sku: string;
  name: string;
  unit: string;
  currentStock: number;
  minimumStock: number;
  stockCost: number;
  stockValue: number;
}
