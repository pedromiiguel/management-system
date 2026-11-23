import { createFileRoute } from '@tanstack/react-router';
import { StockFlow } from '@modules/stock/presentation/flows/stock';

export const Route = createFileRoute('/_app/stock')({
  component: StockFlow,
});
