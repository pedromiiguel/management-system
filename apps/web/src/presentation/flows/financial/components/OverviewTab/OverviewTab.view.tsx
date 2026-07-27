import { PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { BarChart } from '@/presentation/components/BarChart';
import { Card } from '@/presentation/components/Card';
import { DreLine } from '@/presentation/components/DreLine';
import { ProgressBar } from '@/presentation/components/ProgressBar';
import { StatCard } from '@/presentation/components/StatCard';
import { formatBRL } from '@/lib/format';
import type { OverviewTabViewProps } from './OverviewTab.types';

export function OverviewTabView({
  dashboard,
  monthTotals,
  monthLabels,
  totalByMethod,
  targetPct,
}: OverviewTabViewProps) {
  return (
    <>
      <div className="flex gap-3">
        <StatCard
          label="Faturamento (mês)"
          value={formatBRL(dashboard?.revenue.month)}
          sub={`acumulado no ano: ${formatBRL(dashboard?.revenue.year)}`}
        />
        <StatCard label="Vendas (hoje)" value={formatBRL(dashboard?.revenue.day)} sub="receita bruta do dia" />
        <StatCard
          label="Resultado (mês)"
          value={formatBRL(dashboard?.result.profit)}
          sub="receita − CMV − despesas"
          accent
        />
      </div>
      <div className="grid grid-cols-[1fr_350px] gap-3 flex-1 min-h-0">
        <Card className="flex flex-col overflow-auto">
          <div className="s-card-title">
            Faturamento mês a mês <span className="s-dim font-normal">(R$)</span>
          </div>
          <BarChart values={monthTotals} labels={monthLabels} height={150} hl={5} />
          <div className="s-divider my-3.5" />
          <div className="s-card-title mb-1.5">Resultado do período</div>
          <DreLine op="" label="Receita bruta de vendas" value={formatBRL(dashboard?.result.revenue)} />
          <DreLine op="−" label="Custo das mercadorias vendidas (CMV)" value={formatBRL(dashboard?.result.cogs)} />
          <DreLine
            op="="
            label="Margem bruta"
            value={formatBRL(Number(dashboard?.result.revenue ?? 0) - Number(dashboard?.result.cogs ?? 0))}
            strong
          />
          <DreLine op="−" label="Despesas operacionais" value={formatBRL(dashboard?.result.expenses)} />
          <DreLine op="=" label="Resultado líquido" value={formatBRL(dashboard?.result.profit)} strong accent />
        </Card>
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          <Card>
            <div className="s-card-title">Recebimentos por forma de pagamento</div>
            {(dashboard?.byMethodMonth ?? []).map((m) => {
              const pct = totalByMethod > 0 ? (Number(m.total) / totalByMethod) * 100 : 0;
              return (
                <div key={m.paymentMethod} className="mb-2.5">
                  <div className="flex justify-between text-[13px] mb-1">
                    <span>{PAYMENT_METHOD_LABELS[m.paymentMethod]}</span>
                    <b>{formatBRL(m.total)}</b>
                  </div>
                  <ProgressBar pct={pct} height={8} />
                </div>
              );
            })}
            {(dashboard?.byMethodMonth ?? []).length === 0 ? (
              <div className="s-dim text-xs">Sem vendas no mês ainda.</div>
            ) : null}
          </Card>
          <Card className="flex-1">
            <div className="s-card-title">Meta de faturamento</div>
            {dashboard?.target?.monthly ? (
              <>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[22px] font-bold text-[color:var(--ink-900)]">{targetPct}%</span>
                  <span className="s-dim text-xs">
                    {formatBRL(dashboard?.revenue.month)} / {formatBRL(dashboard.target.monthly)}
                  </span>
                </div>
                <ProgressBar pct={targetPct ?? 0} height={12} />
                <div className="s-dim text-xs mt-2.5">
                  {Number(dashboard?.revenue.month ?? 0) >= Number(dashboard.target.monthly)
                    ? 'Meta do mês atingida 🎉'
                    : `Faltam ${formatBRL(Number(dashboard.target.monthly) - Number(dashboard?.revenue.month ?? 0))} para a meta.`}
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
