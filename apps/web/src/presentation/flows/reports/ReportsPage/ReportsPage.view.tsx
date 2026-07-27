import { Screen } from '@/presentation/components/Screen';
import { SBtn, SChip, SSeg } from '@/components/sol';
import { ProductsTab } from '../components/ProductsTab';
import { SalesTab } from '../components/SalesTab';
import { StockTab } from '../components/StockTab';
import type { PeriodChip, ReportsPageViewProps, ReportsTab } from './ReportsPage.types';

const TABS: { id: ReportsTab; label: string }[] = [
  { id: 'sales', label: 'Vendas por período' },
  { id: 'best', label: 'Mais vendidos' },
  { id: 'margin', label: 'Margem por produto' },
  { id: 'stock', label: 'Posição de estoque' },
];

const CHIPS: { id: PeriodChip; label: string }[] = [
  { id: 'today', label: 'Hoje' },
  { id: 'week', label: '7 dias' },
  { id: 'month', label: 'Mês atual' },
];

export function ReportsPageView({
  tab,
  onChangeTab,
  from,
  onChangeFrom,
  to,
  onChangeTo,
  chip,
  onApplyChip,
  onExportCsv,
  isExportingCsv,
}: ReportsPageViewProps) {
  return (
    <Screen title="Relatórios">
      <div className="flex flex-col gap-3 h-full">
        <SSeg<ReportsTab> items={TABS} active={tab} onChange={onChangeTab} />
        {tab !== 'stock' && (
          <div className="flex gap-2.5 items-end">
            <div>
              <div className="s-label">De</div>
              <div className="s-input w-[130px]">
                <input type="date" value={from} onChange={(e) => onChangeFrom(e.target.value)} />
              </div>
            </div>
            <div>
              <div className="s-label">Até</div>
              <div className="s-input w-[130px]">
                <input type="date" value={to} onChange={(e) => onChangeTo(e.target.value)} />
              </div>
            </div>
            {CHIPS.map((c) => (
              <SChip key={c.id} active={chip === c.id} onClick={() => onApplyChip(c.id)}>
                {c.label}
              </SChip>
            ))}
            <span className="flex-1" />
            <SBtn ghost disabled={isExportingCsv} onClick={onExportCsv}>
              Exportar CSV
            </SBtn>
            <SBtn ghost onClick={() => window.print()}>
              Exportar PDF
            </SBtn>
          </div>
        )}
        {tab === 'stock' && (
          <div className="flex justify-end">
            <SBtn ghost disabled={isExportingCsv} onClick={onExportCsv}>
              Exportar CSV
            </SBtn>
          </div>
        )}

        {tab === 'sales' && <SalesTab from={from} to={to} />}
        {(tab === 'best' || tab === 'margin') && <ProductsTab from={from} to={to} margin={tab === 'margin'} />}
        {tab === 'stock' && <StockTab />}
      </div>
    </Screen>
  );
}
