import { ProductsReportFlow } from '../products-report';
import { SalesReportFlow } from '../sales-report';
import { StockReportFlow } from '../stock-report';
import type { TReportTab } from './types';

/** Cada aba: o que mostra, se depende do período e qual CSV exporta. */
export const TABS: TReportTab[] = [
  {
    id: 'sales',
    label: 'Vendas por período',
    usesPeriod: true,
    exportKind: 'sales',
    render: (period) => <SalesReportFlow period={period} />,
  },
  {
    id: 'best',
    label: 'Mais vendidos',
    usesPeriod: true,
    exportKind: 'products',
    render: (period) => <ProductsReportFlow period={period} />,
  },
  {
    id: 'margin',
    label: 'Margem por produto',
    usesPeriod: true,
    exportKind: 'products',
    render: (period) => <ProductsReportFlow period={period} sortByMargin />,
  },
  {
    id: 'stock',
    label: 'Posição de estoque',
    usesPeriod: false,
    exportKind: 'stock',
    render: () => <StockReportFlow />,
  },
];
