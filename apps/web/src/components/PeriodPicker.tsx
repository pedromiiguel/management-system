import { addDaysToKey } from '@beverage/shared';
import { Chip } from '@/components/Chip';
import { monthToDate, todayKey } from '@/lib/format';

/** Período fechado de dias da loja, `AAAA-MM-DD` (a API corta no fuso da loja). */
export type Period = { from: string; to: string };

const PRESETS: { id: string; label: string; period: () => Period }[] = [
  { id: 'today', label: 'Hoje', period: () => ({ from: todayKey(), to: todayKey() }) },
  {
    id: 'week',
    label: '7 dias',
    period: () => ({ from: addDaysToKey(todayKey(), -6), to: todayKey() }),
  },
  { id: 'month', label: 'Mês atual', period: () => monthToDate() },
];

/**
 * Campos De/Até e atalhos de período. O atalho ativo é o que coincide com o
 * período atual — editar uma data à mão desmarca o atalho.
 */
export function PeriodPicker({
  value,
  onChange,
}: {
  value: Period;
  onChange: (period: Period) => void;
}) {
  const active = PRESETS.find((p) => {
    const period = p.period();
    return period.from === value.from && period.to === value.to;
  });

  return (
    <>
      <div>
        <div className="s-label">De</div>
        <div className="s-input w-[130px]">
          <input
            type="date"
            aria-label="De"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </div>
      </div>
      <div>
        <div className="s-label">Até</div>
        <div className="s-input w-[130px]">
          <input
            type="date"
            aria-label="Até"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      </div>
      {PRESETS.map((p) => (
        <Chip key={p.id} active={p === active} onClick={() => onChange(p.period())}>
          {p.label}
        </Chip>
      ))}
    </>
  );
}
