import { createFileRoute } from '@tanstack/react-router';
import { FinancialFlow } from '@modules/financial/presentation/flows/financial';

export const Route = createFileRoute('/_app/financial')({
  component: FinancialFlow,
});
