import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  CashMovementType,
  FinancialCategoryKind,
  manualEntrySchema,
  PAYMENT_METHOD_LABELS,
  type ManualEntryInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Modal, ModalActions } from '@/components/Modal';
import { PeriodPicker } from '@/components/PeriodPicker';
import { StatCard } from '@/components/StatCard';
import { Table } from '@/components/Table';
import { toast } from '@/components/Toast';
import { formatBRL, formatDateTime, monthToDate, moneyText, optionalText } from '@/lib/format';
import { cashFlowQuery, categoriesQuery, useCreateManualEntry } from './api';

export function EntriesTab() {
  const [period, setPeriod] = useState(monthToDate);
  const [creating, setCreating] = useState(false);
  const { data } = useQuery(cashFlowQuery(period.from, period.to));

  return (
    <>
      <div className="flex gap-2.5 items-end">
        <PeriodPicker value={period} onChange={setPeriod} />
        <span className="flex-1" />
        <Button primary onClick={() => setCreating(true)}>
          + Lançamento avulso
        </Button>
      </div>
      <div className="flex gap-3">
        <StatCard label="Entradas" value={formatBRL(data?.inflows)} />
        <StatCard label="Saídas" value={formatBRL(data?.outflows)} />
        <StatCard label="Saldo do período" value={formatBRL(data?.balance)} accent />
      </div>
      <Card pad={8} className="flex-1 min-h-0 overflow-auto">
        <Table
          cols={['Data', 'Descrição', 'Categoria', 'Forma', 'Valor']}
          widths="110px 1fr 150px 90px 110px"
          align={[null, null, null, null, 'right']}
          dense
          emptyText="Nenhum movimento no período"
          rows={(data?.movements ?? []).map((m) => ({
            key: m.id,
            cells: [
              formatDateTime(m.occurredAt),
              m.description,
              m.category?.name ?? '—',
              m.paymentMethod ? PAYMENT_METHOD_LABELS[m.paymentMethod] : '—',
              <b
                className={
                  m.type === CashMovementType.OUTFLOW ? 'text-[color:var(--danger)]' : undefined
                }
              >
                {m.type === CashMovementType.INFLOW ? '+' : '−'}
                {formatBRL(m.amount)}
              </b>,
            ],
          }))}
        />
      </Card>
      {creating ? <ManualEntryModal onClose={() => setCreating(false)} /> : null}
    </>
  );
}

const formSchema = manualEntrySchema.extend({
  amount: moneyText(manualEntrySchema.shape.amount),
  categoryId: optionalText,
});

function ManualEntryModal({ onClose }: { onClose: () => void }) {
  const create = useCreateManualEntry();
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    z.input<typeof formSchema>,
    unknown,
    ManualEntryInput
  >({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      kind: FinancialCategoryKind.EXPENSE,
      amount: '',
      description: '',
      categoryId: '',
    },
  });
  const kind = watch('kind');
  const { data: categories = [] } = useQuery({
    ...categoriesQuery(),
    select: (all) => all.filter((c) => c.kind === kind),
  });

  const selectKind = (next: FinancialCategoryKind) => {
    setValue('kind', next, { shouldValidate: true });
    setValue('categoryId', '');
  };

  const submit = handleSubmit((input) =>
    create.mutate(input, {
      onSuccess: () => {
        toast('Lançamento registrado');
        onClose();
      },
    }),
  );

  return (
    <Modal title="Lançamento avulso (FR-35)" onClose={onClose} width={420}>
      <form onSubmit={submit}>
        <div className="flex gap-2 mb-3">
          <Chip
            active={kind === FinancialCategoryKind.EXPENSE}
            onClick={() => selectKind(FinancialCategoryKind.EXPENSE)}
          >
            Despesa
          </Chip>
          <Chip
            active={kind === FinancialCategoryKind.INCOME}
            onClick={() => selectKind(FinancialCategoryKind.INCOME)}
          >
            Receita
          </Chip>
        </div>
        <div className="s-label">Valor (R$)</div>
        <div className="s-input mb-2.5">
          <input
            autoFocus
            data-testid="manual-entry-amount"
            placeholder="0,00"
            {...register('amount')}
          />
        </div>
        <div className="s-label">Descrição</div>
        <div className="s-input mb-2.5">
          <input data-testid="manual-entry-description" {...register('description')} />
        </div>
        <div className="s-label">Categoria</div>
        <div className="s-input">
          <select {...register('categoryId')}>
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <ModalActions>
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!formState.isValid || create.isPending}>
            Registrar
          </Button>
        </ModalActions>
      </form>
    </Modal>
  );
}
