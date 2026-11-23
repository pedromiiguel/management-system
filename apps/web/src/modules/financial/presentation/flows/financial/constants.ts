import { EntriesFlow } from '../entries';
import { OverviewFlow } from '../overview';
import { PayablesFlow } from '../payables';
import { ReceivablesFlow } from '../receivables';
import { RegisterFlow } from '../register';

export const TABS = [
  { id: 'overview', label: 'Visão geral', Component: OverviewFlow },
  { id: 'register', label: 'Caixa', Component: RegisterFlow },
  { id: 'receivables', label: 'Fiado (a receber)', Component: ReceivablesFlow },
  { id: 'payables', label: 'Contas a pagar', Component: PayablesFlow },
  { id: 'entries', label: 'Fluxo & lançamentos', Component: EntriesFlow },
] as const;
