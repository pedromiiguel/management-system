import { createFileRoute } from '@tanstack/react-router';
import { ReportsPage } from '../../presentation/flows/reports/ReportsPage';

export const Route = createFileRoute('/_app/reports')({
  component: ReportsPage,
});
