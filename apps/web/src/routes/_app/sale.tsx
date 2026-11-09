import { createFileRoute } from '@tanstack/react-router';
import { SalePage } from '@/features/sale/SalePage';

export const Route = createFileRoute('/_app/sale')({
  component: SalePage,
});
