import { useMutation } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { Screen } from '@/components/Screen';
import { SegmentedControl } from '@/components/SegmentedControl';
import { monthToDate, toDateInput } from '@/lib/format';
import { reportCsv } from './api';
import { ProductsTab } from './ProductsTab';
import { SalesTab } from './SalesTab';
import { StockTab } from './StockTab';

type Period = { from: string; to: string };

/** Cada aba: o que mostra, se depende do período e de onde vem o CSV. */
const TABS: {
  id: string;
  label: string;
  usesPeriod: boolean;
  render: (period: Period) => ReactNode;
  csv: (period: Period) => Promise<Blob>;
}[] = [
  {
    id: 'sales',
    label: 'Vendas por período',
    usesPeriod: true,
    render: (p) => <SalesTab from={p.from} to={p.to} />,
    csv: (p) => reportCsv.sales(p.from, p.to),
  },
  {
    id: 'best',
    label: 'Mais vendidos',
    usesPeriod: true,
    render: (p) => <ProductsTab from={p.from} to={p.to} />,
    csv: (p) => reportCsv.products(p.from, p.to),
  },
  {
    id: 'margin',
    label: 'Margem por produto',
    usesPeriod: true,
    render: (p) => <ProductsTab from={p.from} to={p.to} sortByMargin />,
    csv: (p) => reportCsv.products(p.from, p.to),
  },
  {
    id: 'stock',
    label: 'Posição de estoque',
    usesPeriod: false,
    render: () => <StockTab />,
    csv: () => reportCsv.stock(),
  },
];

const PRESETS: { id: string; label: string; period: () => Period }[] = [
  {
    id: 'today',
    label: 'Hoje',
    period: () => ({ from: toDateInput(new Date()), to: toDateInput(new Date()) }),
  },
  {
    id: 'week',
    label: '7 dias',
    period: () => {
      const start = new Date();
      start.setDate(start.getDate() - 6);
      return { from: toDateInput(start), to: toDateInput(new Date()) };
    },
  },
  { id: 'month', label: 'Mês atual', period: () => monthToDate() },
];

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [tabId, setTabId] = useState('sales');
  const [preset, setPreset] = useState('month');
  const [period, setPeriod] = useState(monthToDate);
  const tab = TABS.find((t) => t.id === tabId)!;

  const exportCsv = useMutation({
    mutationFn: () => tab.csv(period),
    onSuccess: (blob) =>
      downloadBlob(blob, `relatorio-${tab.id}-${period.from}-a-${period.to}.csv`),
  });

  const exportButton = (
    <Button ghost disabled={exportCsv.isPending} onClick={() => exportCsv.mutate()}>
      Exportar CSV
    </Button>
  );

  return (
    <Screen title="Relatórios">
      <div className="flex flex-col gap-3 h-full">
        <SegmentedControl items={TABS} active={tab.id} onChange={setTabId} />
        {tab.usesPeriod ? (
          <div className="flex gap-2.5 items-end">
            <div>
              <div className="s-label">De</div>
              <div className="s-input w-[130px]">
                <input
                  type="date"
                  value={period.from}
                  onChange={(e) => setPeriod({ ...period, from: e.target.value })}
                />
              </div>
            </div>
            <div>
              <div className="s-label">Até</div>
              <div className="s-input w-[130px]">
                <input
                  type="date"
                  value={period.to}
                  onChange={(e) => setPeriod({ ...period, to: e.target.value })}
                />
              </div>
            </div>
            {PRESETS.map((p) => (
              <Chip
                key={p.id}
                active={preset === p.id}
                onClick={() => {
                  setPreset(p.id);
                  setPeriod(p.period());
                }}
              >
                {p.label}
              </Chip>
            ))}
            <span className="flex-1" />
            {exportButton}
            <Button ghost onClick={() => window.print()}>
              Exportar PDF
            </Button>
          </div>
        ) : (
          <div className="flex justify-end">{exportButton}</div>
        )}
        {tab.render(period)}
      </div>
    </Screen>
  );
}
