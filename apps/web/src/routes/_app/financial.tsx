import { createFileRoute } from '@tanstack/react-router';
import { FinancialPage } from '@/features/financial/FinancialPage';

export const Route = createFileRoute('/_app/financial')({
  component: FinancialPage,
});
