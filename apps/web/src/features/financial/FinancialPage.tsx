import { useState } from 'react';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { EntriesTab } from './EntriesTab';
import { OverviewTab } from './OverviewTab';
import { PayablesTab } from './PayablesTab';
import { ReceivablesTab } from './ReceivablesTab';
import { RegisterTab } from './RegisterTab';

const TABS = [
  { id: 'overview', label: 'Visão geral', Component: OverviewTab },
  { id: 'register', label: 'Caixa', Component: RegisterTab },
  { id: 'receivables', label: 'Fiado (a receber)', Component: ReceivablesTab },
  { id: 'payables', label: 'Contas a pagar', Component: PayablesTab },
  { id: 'entries', label: 'Fluxo & lançamentos', Component: EntriesTab },
] as const;

type Tab = (typeof TABS)[number]['id'];

export function FinancialPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const { Component } = TABS.find((t) => t.id === tab)!;
  const monthLabel = new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <Screen title="Financeiro" topRight={<Chip active>{monthLabel}</Chip>}>
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl<Tab> items={[...TABS]} active={tab} onChange={setTab} />
        <Component />
      </div>
    </Screen>
  );
}
