import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  dateOnlyKey,
  FinancialCategoryKind,
  payableSchema,
  type PayableInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Field } from '@/components/Field';
import { Modal } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/components/Toast';
import { formatBRL, formatDateOnly, moneyText, optionalText, todayKey } from '@/lib/format';
import { categoriesQuery, payablesQuery, useCreatePayable, usePayPayable } from './api';

export function PayablesTab() {
  const [creating, setCreating] = useState(false);
  const { data: payables = [] } = useQuery(payablesQuery());
  const pay = usePayPayable();
  const today = todayKey();

  return (
    <Card pad={8} className="flex-1 min-h-0 overflow-auto">
      <div className="flex justify-between px-2.5 pt-2 pb-1">
        <div className="s-card-title m-0">Contas em aberto</div>
        <Button primary onClick={() => setCreating(true)}>
          + Nova conta
        </Button>
      </div>
      <Table
        cols={['Descrição', 'Fornecedor', 'Categoria', 'Vencimento', 'Valor', '']}
        widths="1fr 140px 130px 110px 100px 100px"
        align={[null, null, null, null, 'right', 'right']}
        dense
        emptyText="Nenhuma conta em aberto ✓"
        rows={payables.map((p) => ({
          key: p.id,
          cells: [
            p.description,
            p.supplier ?? '—',
            p.category?.name ?? '—',
            dateOnlyKey(p.dueDate) < today ? (
              <Tag tone="danger">{formatDateOnly(p.dueDate)}</Tag>
            ) : (
              formatDateOnly(p.dueDate)
            ),
            <b>{formatBRL(p.amount)}</b>,
            <Button
              ghost
              onClick={() =>
                pay.mutate(p.id, {
                  onSuccess: () => toast('Conta paga — saída registrada no fluxo'),
                })
              }
            >
              Pagar
            </Button>,
          ],
        }))}
      />
      {creating ? <PayableModal onClose={() => setCreating(false)} /> : null}
    </Card>
  );
}

const formSchema = payableSchema.extend({
  amount: moneyText(payableSchema.shape.amount),
  supplier: optionalText,
  categoryId: optionalText,
});

function PayableModal({ onClose }: { onClose: () => void }) {
  const { data: categories = [] } = useQuery({
    ...categoriesQuery(),
    select: (all) => all.filter((c) => c.kind === FinancialCategoryKind.EXPENSE),
  });
  const create = useCreatePayable();
  const { register, handleSubmit, formState } = useForm<
    z.input<typeof formSchema>,
    unknown,
    PayableInput
  >({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      description: '',
      supplier: '',
      amount: '',
      dueDate: todayKey(),
      categoryId: '',
    },
  });

  const submit = handleSubmit((input) =>
    create.mutate(input, {
      onSuccess: () => {
        toast('Conta registrada');
        onClose();
      },
    }),
  );

  return (
    <Modal title="Nova conta a pagar" onClose={onClose} width={460}>
      <form onSubmit={submit} className="flex flex-col gap-2.5">
        <Field label="Descrição">
          <input autoFocus data-testid="payable-description" {...register('description')} />
        </Field>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="Fornecedor — opcional">
            <input {...register('supplier')} />
          </Field>
          <Field className="w-[130px]" label="Valor (R$)">
            <input data-testid="payable-amount" placeholder="0,00" {...register('amount')} />
          </Field>
        </div>
        <div className="flex gap-2.5">
          <Field className="flex-1" label="Vencimento">
            <input type="date" {...register('dueDate')} />
          </Field>
          <Field className="flex-1" label="Categoria">
            <select {...register('categoryId')}>
              <option value="">—</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="flex gap-2 justify-end">
          <Button ghost onClick={onClose}>
            Voltar
          </Button>
          <Button primary type="submit" disabled={!formState.isValid || create.isPending}>
            Salvar
          </Button>
        </div>
      </form>
    </Modal>
  );
}
