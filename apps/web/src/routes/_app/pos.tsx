import { createFileRoute } from '@tanstack/react-router';
import { PosPage } from '../../presentation/pos/PosPage';
import { getUser } from '../../lib/auth';

export const Route = createFileRoute('/_app/pos')({
  component: () => <PosPage operatorName={getUser()?.name} />,
});
