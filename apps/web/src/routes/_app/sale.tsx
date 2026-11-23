import { createFileRoute } from '@tanstack/react-router';
import { SaleFlow } from '@modules/sale/presentation/flows/sale';

export const Route = createFileRoute('/_app/sale')({
  component: SaleFlow,
});
