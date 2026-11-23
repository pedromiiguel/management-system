import { PAYMENT_METHOD_LABELS, SERVICE_FEE_PERCENT } from '@beverage/shared';
import { BarChart } from '@presentation/components/BarChart';
import { Card } from '@presentation/components/Card';
import { StatCard } from '@presentation/components/StatCard';
import { formatBRL } from '@presentation/utils/format';
import { ProgressBar } from '../../components/progress-bar';
import { CHART_HEIGHT } from './constants';
import { DreLine } from './dre-line';
import type { TOverviewLayoutProps } from './types';
import { monthLabel } from './utils';

export function OverviewLayout({
  dashboard,
  grossMargin,
  methodShares,
  target,
}: TOverviewLayoutProps) {
  const monthly = dashboard?.monthly ?? [];
  const result = dashboard?.result;

  return (
    <>
      <div className="flex gap-3">
        <StatCard
          label="Receita (mês)"
          value={formatBRL(dashboard?.revenue.month)}
          sub={`produtos, sem taxa de serviço · no ano: ${formatBRL(dashboard?.revenue.year)}`}
        />
        <StatCard
          label="Receita (hoje)"
          value={formatBRL(dashboard?.revenue.day)}
          sub="produtos vendidos hoje, sem taxa de serviço"
        />
        <StatCard
          label="Taxa de serviço (mês)"
          value={formatBRL(dashboard?.serviceFee.month)}
          sub={`${SERVICE_FEE_PERCENT}% do subtotal — fica com a casa`}
        />
        <StatCard
          label="Resultado (mês)"
          value={formatBRL(result?.profit)}
          sub="receita + taxa de serviço − CMV − despesas"
          accent
        />
      </div>
      <div className="grid grid-cols-[1fr_350px] gap-3 flex-1 min-h-0">
        <Card className="flex flex-col overflow-auto">
          <div className="s-card-title">
            Receita mês a mês <span className="s-dim font-normal">(R$)</span>
          </div>
          <BarChart
            values={monthly.map((month) => month.revenue)}
            labels={monthly.map((month) => monthLabel(month.month))}
            height={CHART_HEIGHT}
            hl={monthly.length - 1}
          />
          <div className="s-divider my-3.5" />
          <div className="s-card-title mb-1.5">Resultado do período</div>
          <DreLine op="" label="Receita de vendas (produtos)" value={formatBRL(result?.revenue)} />
          <DreLine op="+" label="Taxa de serviço" value={formatBRL(result?.serviceFee)} />
          <DreLine
            op="−"
            label="Custo das mercadorias vendidas (CMV)"
            value={formatBRL(result?.cogs)}
          />
          <DreLine op="=" label="Margem bruta" value={formatBRL(grossMargin)} isStrong />
          <DreLine op="−" label="Despesas operacionais" value={formatBRL(result?.expenses)} />
          <DreLine
            op="="
            label="Resultado líquido"
            value={formatBRL(result?.profit)}
            isStrong
            isResult
          />
        </Card>
        <div className="flex flex-col gap-3 min-h-0 overflow-auto">
          <Card>
            <div className="s-card-title">Recebimentos por forma de pagamento</div>
            <div className="s-dim text-xs mb-2">Valor cobrado no mês, com a taxa de serviço.</div>
            {methodShares.map((share) => (
              <div key={share.paymentMethod} className="mb-2.5">
                <div className="flex justify-between text-[13px] mb-1">
                  <span>{PAYMENT_METHOD_LABELS[share.paymentMethod]}</span>
                  <b>{formatBRL(share.total)}</b>
                </div>
                <ProgressBar percent={share.percent} height={8} />
              </div>
            ))}
            {methodShares.length === 0 ? (
              <div className="s-dim text-xs">Sem vendas no mês ainda.</div>
            ) : null}
          </Card>
          <Card className="flex-1">
            <div className="s-card-title">Meta de receita</div>
            {target ? (
              <>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-[22px] font-bold text-[color:var(--ink-900)]">
                    {target.percent}%
                  </span>
                  <span className="s-dim text-xs">
                    {formatBRL(target.revenue)} / {formatBRL(target.target)}
                  </span>
                </div>
                <ProgressBar percent={target.percent} height={12} />
                <div className="s-dim text-xs mt-2.5">
                  {target.missing === null
                    ? 'Meta do mês atingida 🎉'
                    : `Faltam ${formatBRL(target.missing)} para a meta.`}
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
