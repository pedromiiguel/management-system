import { createFileRoute } from '@tanstack/react-router';
import { ReportsFlow } from '@modules/reports/presentation/flows/reports';

export const Route = createFileRoute('/_app/reports')({
  component: ReportsFlow,
});
