import { useQueries, useQuery } from '@tanstack/react-query';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { BarChart } from '@/components/BarChart';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { formatBRL, toDateInput } from '@/lib/format';
import { salesReportQuery } from '@/features/reports/api';
import { dashboardQuery } from './api';

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

/** Os últimos 6 meses (o atual por último). */
function lastSixMonths(now = new Date()) {
  return Array.from({ length: 6 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return {
      from: toDateInput(start),
      to: toDateInput(end),
      label: MONTH_LABELS[start.getMonth()]!,
    };
  });
}

export function OverviewTab() {
  const { data: dashboard } = useQuery(dashboardQuery());
  const months = lastSixMonths();
  const monthTotals = useQueries({
    queries: months.map((m) => ({ ...salesReportQuery(m.from, m.to), staleTime: 60_000 })),
  }).map((q) => q.data?.total ?? 0);

  const byMethod = dashboard?.byMethodMonth ?? [];
  const totalByMethod = byMethod.reduce((acc, m) => acc + m.total, 0);
  const revenueMonth = dashboard?.revenue.month ?? 0;
  const target = dashboard?.target.monthly;
  const progress = dashboard?.target.progress;
  const targetPct = progress ? Math.round(progress * 100) : null;
  const result = dashboard?.result;

  return (
    <>
      <div className="flex gap-3">
        <StatCard
          label="Faturamento (mês)"
          value={formatBRL(dashboard?.revenue.month)}
          sub={`acumulado no ano: ${formatBRL(dashboard?.revenue.year)}`}
        />
        <StatCard
          label="Vendas (hoje)"
          value={formatBRL(dashboard?.revenue.day)}
          sub="receita bruta do dia"
        />
        <StatCard
          label="Resultado (mês)"
          value={formatBRL(result?.profit)}
          sub="receita − CMV − despesas"
          accent
        />
      </div>
      <div className="grid grid-cols-[1fr_350px] gap-3 flex-1 min-h-0">
        <Card className="flex flex-col overflow-auto">
          <div className="s-card-title">
            Faturamento mês a mês <span className="s-dim font-normal">(R$)</span>
          </div>
          <BarChart values={monthTotals} labels={months.map((m) => m.label)} height={150} hl={5} />
          <div className="s-divider my-3.5" />
          <div className="s-card-title mb-1.5">Resultado do período</div>
          <DreLine op="" label="Receita bruta de vendas" value={formatBRL(result?.revenue)} />
          <DreLine
            op="−"
            label="Custo das mercadorias vendidas (CMV)"
            value={formatBRL(result?.cogs)}
          />
          <DreLine
            op="="
            label="Margem bruta"
            value={formatBRL((result?.revenue ?? 0) - (result?.cogs ?? 0))}
            strong
          />
          <DreLine op="−" label="Despesas operacionais" value={formatBRL(result?.expenses)} />
          <DreLine
            op="="
            label="Resultado líquido"
            value={formatBRL(result?.profit)}
            strong
            accent
          />
        </Card>
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          <Card>
            <div className="s-card-title">Recebimentos por forma de pagamento</div>
            {byMethod.map((m) => (
              <div key={m.paymentMethod} className="mb-2.5">
                <div className="flex justify-between text-[13px] mb-1">
                  <span>{PAYMENT_METHOD_LABELS[m.paymentMethod]}</span>
                  <b>{formatBRL(m.total)}</b>
                </div>
                <ProgressBar
                  pct={totalByMethod > 0 ? (m.total / totalByMethod) * 100 : 0}
                  height={8}
                />
              </div>
            ))}
            {byMethod.length === 0 ? (
              <div className="s-dim text-xs">Sem vendas no mês ainda.</div>
            ) : null}
          </Card>
          <Card className="flex-1">
            <div className="s-card-title">Meta de faturamento</div>
            {target ? (
              <>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[22px] font-bold text-[color:var(--ink-900)]">
                    {targetPct}%
                  </span>
                  <span className="s-dim text-xs">
                    {formatBRL(revenueMonth)} / {formatBRL(target)}
                  </span>
                </div>
                <ProgressBar pct={targetPct ?? 0} height={12} />
                <div className="s-dim text-xs mt-2.5">
                  {revenueMonth >= target
                    ? 'Meta do mês atingida 🎉'
                    : `Faltam ${formatBRL(target - revenueMonth)} para a meta.`}
                </div>
              </>
            ) : (
              <div className="s-dim text-xs">
                Meta não configurada — defina em Configurações (opcional, FR-36).
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}

/** Linha do demonstrativo de resultado: operador, rótulo e valor. */
function DreLine({
  op,
  label,
  value,
  strong,
  accent,
}: {
  op: string;
  label: string;
  value: ReactNode;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className={clsx('s-dre', strong && 'is-strong', accent && 'is-result')}>
      <span className="s-dre-op">{op}</span>
      <span style={{ flex: 1 }}>{label}</span>
      <span className="s-dre-val">{value}</span>
    </div>
  );
}

function ProgressBar({ pct, height = 10 }: { pct: number; height?: number }) {
  return (
    <div className="s-progress" style={{ height }}>
      <div className="s-progress-fill" style={{ width: `${Math.min(100, Math.max(0, pct))}%` }} />
    </div>
  );
}
