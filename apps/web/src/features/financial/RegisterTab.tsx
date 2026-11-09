import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  CASH_MOVEMENT_LABELS,
  CashMovementType,
  cashMovementSchema,
  closeRegisterSchema,
  openRegisterSchema,
  PAYMENT_METHOD_LABELS,
  type CashMovementInput,
  type PaymentMethod,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Modal, ModalActions } from '@/components/Modal';
import { Table } from '@/components/Table';
import { Tag } from '@/components/Tag';
import { toast } from '@/components/Toast';
import { formatBRL, formatDateTime, moneyText } from '@/lib/format';
import {
  currentRegisterQuery,
  registerHistoryQuery,
  useCloseRegister,
  useCreateCashMovement,
  useOpenRegister,
} from './api';

const MOVEMENT_TONES: Record<CashMovementType, 'ok' | 'accent' | 'warn'> = {
  INFLOW: 'ok',
  FLOAT: 'accent',
  PULL: 'warn',
  OUTFLOW: 'warn',
};

/** Entradas e suprimentos somam na gaveta; saídas e sangrias tiram. */
const ADDS_TO_DRAWER = new Set<CashMovementType>([CashMovementType.INFLOW, CashMovementType.FLOAT]);

export function RegisterTab() {
  const [modal, setModal] = useState<'none' | 'open' | 'move' | 'close'>('none');
  const { data: register } = useQuery(currentRegisterQuery());
  const { data: history = [] } = useQuery(registerHistoryQuery());
  const openRegister = useOpenRegister();
  const closeRegister = useCloseRegister();
  const closeModal = () => setModal('none');

  return (
    <div className="grid grid-cols-[1fr_350px] gap-3 flex-1 min-h-0">
      <Card pad={8} className="min-h-0 overflow-auto">
        <div className="flex justify-between items-center px-2.5 pt-2 pb-1">
          <div className="s-card-title m-0">
            {register ? 'Movimentos do turno' : 'Fechamentos anteriores'}
          </div>
          <div className="flex gap-2">
            {register ? (
              <>
                <Button ghost onClick={() => setModal('move')}>
                  Sangria / Suprimento
                </Button>
                <Button primary onClick={() => setModal('close')}>
                  Fechar caixa
                </Button>
              </>
            ) : (
              <Button primary onClick={() => setModal('open')}>
                Abrir caixa
              </Button>
            )}
          </div>
        </div>
        {register ? (
          <Table
            cols={['Hora', 'Descrição', 'Tipo', 'Forma', 'Valor']}
            widths="90px 1fr 110px 90px 100px"
            align={[null, null, null, null, 'right']}
            dense
            emptyText="Nenhum movimento no turno"
            rows={(register.movements ?? []).map((m) => ({
              key: m.id,
              cells: [
                formatDateTime(m.occurredAt).slice(-5),
                m.description,
                <Tag tone={MOVEMENT_TONES[m.type]}>{CASH_MOVEMENT_LABELS[m.type]}</Tag>,
                m.paymentMethod ? PAYMENT_METHOD_LABELS[m.paymentMethod] : '—',
                <b>
                  {ADDS_TO_DRAWER.has(m.type) ? '+' : '−'}
                  {formatBRL(m.amount)}
                </b>,
              ],
            }))}
          />
        ) : (
          <Table
            cols={['Abertura', 'Fechamento', 'Operador', 'Esperado', 'Contado', 'Diferença']}
            widths="110px 110px 1fr 100px 100px 100px"
            align={[null, null, null, 'right', 'right', 'right']}
            dense
            emptyText="Nenhum fechamento registrado"
            rows={history.map((r) => ({
              key: r.id,
              cells: [
                formatDateTime(r.openedAt),
                formatDateTime(r.closedAt),
                r.operator.name,
                formatBRL(r.expectedBalance),
                formatBRL(r.countedBalance),
                <Tag tone={!r.difference ? 'ok' : r.difference > 0 ? 'accent' : 'danger'}>
                  {formatBRL(r.difference)}
                </Tag>,
              ],
            }))}
          />
        )}
      </Card>

      <div className="flex flex-col gap-3">
        <Card>
          <div className="s-card-title">Situação do caixa</div>
          {register ? (
            <>
              <div className="s-kv">
                <span>Status</span>
                <Tag tone="ok">aberto</Tag>
              </div>
              <div className="s-kv">
                <span>Operador</span>
                <b>{register.operator.name}</b>
              </div>
              <div className="s-kv">
                <span>Abertura</span>
                <b>{formatDateTime(register.openedAt)}</b>
              </div>
              <div className="s-kv">
                <span>Saldo inicial</span>
                <b>{formatBRL(register.openingBalance)}</b>
              </div>
              <div className="s-divider" />
              <div className="s-kv">
                <span>Sangrias</span>
                <b>−{formatBRL(register.summary?.pulls)}</b>
              </div>
              <div className="s-kv">
                <span>Suprimentos</span>
                <b>+{formatBRL(register.summary?.floats)}</b>
              </div>
              <div className="s-kv is-troco">
                <span>Dinheiro esperado na gaveta</span>
                <b>{formatBRL(register.summary?.expectedCash)}</b>
              </div>
            </>
          ) : (
            <div className="s-dim text-[13px]">
              Caixa fechado. Abra o caixa para receber vendas em dinheiro.
            </div>
          )}
        </Card>
        {register?.summary ? (
          <Card>
            <div className="s-card-title">Recebido no turno (por forma)</div>
            {Object.entries(register.summary.inflowsByMethod).map(([method, value]) => (
              <div key={method} className="s-kv">
                <span>{PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method}</span>
                <b>{formatBRL(value)}</b>
              </div>
            ))}
            {Object.keys(register.summary.inflowsByMethod).length === 0 ? (
              <div className="s-dim text-xs">Nenhum recebimento ainda.</div>
            ) : null}
          </Card>
        ) : null}
      </div>

      {modal === 'open' ? (
        <MoneyPromptModal
          title="Abrir caixa"
          label="Saldo inicial / troco (R$)"
          submitLabel="Abrir caixa"
          width={380}
          rule={openRegisterSchema.shape.openingBalance}
          pending={openRegister.isPending}
          onSubmit={(openingBalance) =>
            openRegister.mutate(
              { openingBalance },
              {
                onSuccess: () => {
                  toast('Caixa aberto');
                  closeModal();
                },
              },
            )
          }
          onClose={closeModal}
        />
      ) : null}
      {modal === 'move' ? <CashMoveModal onClose={closeModal} /> : null}
      {modal === 'close' && register ? (
        <MoneyPromptModal
          title="Fechar caixa (conferência — BR-06)"
          label="Saldo contado (R$)"
          submitLabel="Fechar caixa"
          width={400}
          rule={closeRegisterSchema.shape.countedBalance}
          pending={closeRegister.isPending}
          header={
            <div className="s-kv">
              <span>Dinheiro esperado na gaveta</span>
              <b>{formatBRL(register.summary?.expectedCash)}</b>
            </div>
          }
          footer={(counted) => (
            <Difference value={counted - (register.summary?.expectedCash ?? 0)} />
          )}
          onSubmit={(countedBalance) =>
            closeRegister.mutate(
              { countedBalance },
              {
                onSuccess: ({ difference }) => {
                  toast(
                    !difference
                      ? 'Caixa fechado — diferença zero ✓'
                      : `Caixa fechado — ${difference > 0 ? 'sobra' : 'falta'} de ${formatBRL(Math.abs(difference))}`,
                    difference ? 'warn' : 'info',
                  );
                  closeModal();
                },
              },
            )
          }
          onClose={closeModal}
        />
      ) : null}
    </div>
  );
}

function Difference({ value }: { value: number }) {
  return (
    <div className="s-kv is-troco mt-2">
      <span>Diferença</span>
      <b
        className={
          value === 0
            ? 'text-[color:var(--ok)]'
            : value < 0
              ? 'text-[color:var(--danger)]'
              : undefined
        }
      >
        {formatBRL(value)}
      </b>
    </div>
  );
}

/** Pede um valor em R$ (abertura e fechamento de caixa), validado pela regra do shared. */
function MoneyPromptModal({
  title,
  label,
  submitLabel,
  width,
  rule,
  pending,
  header,
  footer,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  submitLabel: string;
  width: number;
  rule: z.ZodType<number, number>;
  pending: boolean;
  header?: ReactNode;
  /** Conteúdo abaixo do campo, enquanto o valor digitado é válido. */
  footer?: (value: number) => ReactNode;
  onSubmit: (value: number) => void;
  onClose: () => void;
}) {
  const [raw, setRaw] = useState('');
  const parsed = moneyText(rule).safeParse(raw);
  const submit = () => parsed.success && !pending && onSubmit(parsed.data);

  return (
    <Modal title={title} onClose={onClose} width={width}>
      {header}
      <div className={header ? 's-label mt-2.5' : 's-label'}>{label}</div>
      <div className="s-input">
        <input
          autoFocus
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="0,00"
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </div>
      {parsed.success && footer ? footer(parsed.data) : null}
      <ModalActions>
        <Button ghost onClick={onClose}>
          Voltar
        </Button>
        <Button primary disabled={!parsed.success || pending} onClick={submit}>
          {submitLabel}
        </Button>
      </ModalActions>
    </Modal>
  );
}

const MOVEMENT_TYPES = [
  CashMovementType.PULL,
  CashMovementType.FLOAT,
  CashMovementType.OUTFLOW,
] as const;

const moveFormSchema = cashMovementSchema.extend({
  amount: moneyText(cashMovementSchema.shape.amount),
});

/** Sangria, suprimento ou saída avulsa do caixa aberto. */
function CashMoveModal({ onClose }: { onClose: () => void }) {
  const create = useCreateCashMovement();
  const { register, handleSubmit, watch, setValue, formState } = useForm<
    z.input<typeof moveFormSchema>,
    unknown,
    CashMovementInput
  >({
    resolver: zodResolver(moveFormSchema),
    mode: 'onChange',
    defaultValues: { type: CashMovementType.PULL, amount: '', description: '' },
  });
  const type = watch('type');

  const submit = handleSubmit((input) =>
    create.mutate(input, {
      onSuccess: () => {
        toast(input.type === CashMovementType.PULL ? 'Sangria registrada' : 'Movimento registrado');
        onClose();
      },
    }),
  );

  return (
    <Modal title="Movimento de caixa" onClose={onClose} width={420}>
      <form onSubmit={submit}>
        <div className="flex gap-2 mb-3">
          {MOVEMENT_TYPES.map((t) => (
            <Chip
              key={t}
              active={type === t}
              onClick={() => setValue('type', t, { shouldValidate: true })}
            >
              {CASH_MOVEMENT_LABELS[t]}
            </Chip>
          ))}
        </div>
        <div className="s-label">Valor (R$)</div>
        <div className="s-input mb-2.5">
          <input
            autoFocus
            data-testid="cash-move-amount"
            placeholder="0,00"
            {...register('amount')}
          />
        </div>
        <div className="s-label">Descrição</div>
        <div className="s-input">
          <input
            data-testid="cash-move-description"
            placeholder={
              type === CashMovementType.PULL ? 'ex.: depósito no banco' : 'ex.: reforço de troco'
            }
            {...register('description')}
          />
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
