import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  CASH_MOVEMENT_LABELS,
  CashMovementType,
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from '@beverage/shared';
import { Screen } from '../_app';
import {
  SBars,
  SBtn,
  SCard,
  SChip,
  SDre,
  SModal,
  SProgress,
  SSeg,
  SStat,
  STable,
  STag,
  useToast,
} from '../../components/sol';
import { api, apiErrorMessage } from '../../lib/api';
import { formatBRL, formatDate, formatDateTime, parseMoney, toDateInput } from '../../lib/format';
import type {
  CashMovement,
  CashRegister,
  Dashboard,
  FinancialCategory,
  Payable,
  Receivable,
} from '../../lib/types';

export const Route = createFileRoute('/_app/financial')({
  component: FinancialPage,
});

type Tab = 'overview' | 'register' | 'receivables' | 'payables' | 'entries';

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function FinancialPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const now = new Date();

  return (
    <Screen
      title="Financeiro"
      topRight={
        <SChip active>
          {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </SChip>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
        <SSeg<Tab>
          items={[
            { id: 'overview', label: 'Visão geral' },
            { id: 'register', label: 'Caixa' },
            { id: 'receivables', label: 'Fiado (a receber)' },
            { id: 'payables', label: 'Contas a pagar' },
            { id: 'entries', label: 'Fluxo & lançamentos' },
          ]}
          active={tab}
          onChange={setTab}
        />
        {tab === 'overview' && <OverviewTab />}
        {tab === 'register' && <RegisterTab />}
        {tab === 'receivables' && <ReceivablesTab />}
        {tab === 'payables' && <PayablesTab />}
        {tab === 'entries' && <EntriesTab />}
      </div>
    </Screen>
  );
}

// ---------- Visão geral (FR-32/33/34/36) ----------

function OverviewTab() {
  const { data: dash } = useQuery({
    queryKey: ['financial', 'dashboard'],
    queryFn: async () => (await api.get<Dashboard>('/financial/dashboard')).data,
  });

  // Faturamento mês a mês (6 meses) — agregados leves por mês
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    return { from: d, to: new Date(d.getFullYear(), d.getMonth() + 1, 0) };
  });
  const monthQueries = useQueries({
    queries: months.map((m) => ({
      queryKey: ['reports', 'sales', toDateInput(m.from), toDateInput(m.to)],
      queryFn: async () =>
        (await api.get<{ total: number }>('/reports/sales', {
          params: { from: toDateInput(m.from), to: toDateInput(m.to) },
        })).data,
      staleTime: 60_000,
    })),
  });
  const monthTotals = monthQueries.map((q) => Number(q.data?.total ?? 0));
  const monthLabels = months.map((m) => MONTH_LABELS[m.from.getMonth()]!);

  const totalByMethod = (dash?.byMethodMonth ?? []).reduce((acc, m) => acc + Number(m.total), 0);
  const target = dash?.target;
  const targetPct = target?.progress ? Math.round(Number(target.progress) * 100) : null;

  return (
    <>
      <div style={{ display: 'flex', gap: 12 }}>
        <SStat
          label="Faturamento (mês)"
          value={formatBRL(dash?.revenue.month)}
          sub={`acumulado no ano: ${formatBRL(dash?.revenue.year)}`}
        />
        <SStat label="Vendas (hoje)" value={formatBRL(dash?.revenue.day)} sub="receita bruta do dia" />
        <SStat
          label="Resultado (mês)"
          value={formatBRL(dash?.result.profit)}
          sub="receita − CMV − despesas"
          accent
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 12, flex: 1, minHeight: 0 }}>
        <SCard style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          <div className="s-card-title">
            Faturamento mês a mês <span className="s-dim" style={{ fontWeight: 400 }}>(R$)</span>
          </div>
          <SBars values={monthTotals} labels={monthLabels} height={150} hl={5} />
          <div className="s-divider" style={{ margin: '14px 0 10px' }} />
          <div className="s-card-title" style={{ marginBottom: 6 }}>Resultado do período</div>
          <SDre op="" label="Receita bruta de vendas" value={formatBRL(dash?.result.revenue)} />
          <SDre op="−" label="Custo das mercadorias vendidas (CMV)" value={formatBRL(dash?.result.cogs)} />
          <SDre
            op="="
            label="Margem bruta"
            value={formatBRL(Number(dash?.result.revenue ?? 0) - Number(dash?.result.cogs ?? 0))}
            strong
          />
          <SDre op="−" label="Despesas operacionais" value={formatBRL(dash?.result.expenses)} />
          <SDre op="=" label="Resultado líquido" value={formatBRL(dash?.result.profit)} strong accent />
        </SCard>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, overflow: 'auto' }}>
          <SCard>
            <div className="s-card-title">Recebimentos por forma de pagamento</div>
            {(dash?.byMethodMonth ?? []).map((m) => {
              const pct = totalByMethod > 0 ? (Number(m.total) / totalByMethod) * 100 : 0;
              return (
                <div key={m.paymentMethod} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{PAYMENT_METHOD_LABELS[m.paymentMethod]}</span>
                    <b>{formatBRL(m.total)}</b>
                  </div>
                  <SProgress pct={pct} height={8} />
                </div>
              );
            })}
            {(dash?.byMethodMonth ?? []).length === 0 && (
              <div className="s-dim" style={{ fontSize: 12.5 }}>Sem vendas no mês ainda.</div>
            )}
          </SCard>
          <SCard style={{ flex: 1 }}>
            <div className="s-card-title">Meta de faturamento</div>
            {target?.monthly ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--sol-900)' }}>
                    {targetPct}%
                  </span>
                  <span className="s-dim" style={{ fontSize: 12.5 }}>
                    {formatBRL(dash?.revenue.month)} / {formatBRL(target.monthly)}
                  </span>
                </div>
                <SProgress pct={targetPct ?? 0} height={12} />
                <div className="s-dim" style={{ fontSize: 12.5, marginTop: 10 }}>
                  {Number(dash?.revenue.month ?? 0) >= Number(target.monthly)
                    ? 'Meta do mês atingida 🎉'
                    : `Faltam ${formatBRL(Number(target.monthly) - Number(dash?.revenue.month ?? 0))} para a meta.`}
                </div>
              </>
            ) : (
              <div className="s-dim" style={{ fontSize: 12.5 }}>
                Meta não configurada — defina em Configurações (opcional, FR-36).
              </div>
            )}
          </SCard>
        </div>
      </div>
    </>
  );
}

// ---------- Caixa (FR-27, BR-06) ----------

function RegisterTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [modal, setModal] = useState<'none' | 'open' | 'move' | 'close'>('none');

  const { data: register } = useQuery({
    queryKey: ['cash-register', 'current'],
    queryFn: async () => (await api.get<CashRegister | null>('/cash-register/current')).data,
  });
  const { data: history = [] } = useQuery({
    queryKey: ['cash-register', 'history'],
    queryFn: async () => (await api.get<CashRegister[]>('/cash-register/history')).data,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['cash-register'] });
    void queryClient.invalidateQueries({ queryKey: ['financial'] });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 12, flex: 1, minHeight: 0 }}>
      <SCard pad={8} style={{ minHeight: 0, overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px 4px' }}>
          <div className="s-card-title" style={{ margin: 0 }}>
            {register ? 'Movimentos do turno' : 'Fechamentos anteriores'}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {register ? (
              <>
                <SBtn ghost onClick={() => setModal('move')}>Sangria / Suprimento</SBtn>
                <SBtn primary onClick={() => setModal('close')}>Fechar caixa</SBtn>
              </>
            ) : (
              <SBtn primary onClick={() => setModal('open')}>Abrir caixa</SBtn>
            )}
          </div>
        </div>
        {register ? (
          <STable
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
                <STag key="t" tone={m.type === 'INFLOW' ? 'ok' : m.type === 'FLOAT' ? 'accent' : 'warn'}>
                  {CASH_MOVEMENT_LABELS[m.type as CashMovementType]}
                </STag>,
                m.paymentMethod ? PAYMENT_METHOD_LABELS[m.paymentMethod] : '—',
                <b key="v">{m.type === 'INFLOW' || m.type === 'FLOAT' ? '+' : '−'}{formatBRL(m.amount)}</b>,
              ],
            }))}
          />
        ) : (
          <STable
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
                Number(r.difference) === 0 ? (
                  <STag key="d" tone="ok">R$ 0,00</STag>
                ) : (
                  <STag key="d" tone={Number(r.difference) > 0 ? 'accent' : 'danger'}>
                    {formatBRL(r.difference)}
                  </STag>
                ),
              ],
            }))}
          />
        )}
      </SCard>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <SCard>
          <div className="s-card-title">Situação do caixa</div>
          {register ? (
            <>
              <div className="s-kv"><span>Status</span><STag tone="ok">aberto</STag></div>
              <div className="s-kv"><span>Operador</span><b>{register.operator.name}</b></div>
              <div className="s-kv"><span>Abertura</span><b>{formatDateTime(register.openedAt)}</b></div>
              <div className="s-kv"><span>Saldo inicial</span><b>{formatBRL(register.openingBalance)}</b></div>
              <div className="s-divider" />
              <div className="s-kv"><span>Sangrias</span><b>−{formatBRL(register.summary?.pulls)}</b></div>
              <div className="s-kv"><span>Suprimentos</span><b>+{formatBRL(register.summary?.floats)}</b></div>
              <div className="s-kv is-troco">
                <span>Dinheiro esperado na gaveta</span>
                <b>{formatBRL(register.summary?.expectedCash)}</b>
              </div>
            </>
          ) : (
            <div className="s-dim" style={{ fontSize: 13 }}>
              Caixa fechado. Abra o caixa para receber vendas em dinheiro.
            </div>
          )}
        </SCard>
        {register?.summary && (
          <SCard>
            <div className="s-card-title">Recebido no turno (por forma)</div>
            {Object.entries(register.summary.inflowsByMethod).map(([method, value]) => (
              <div key={method} className="s-kv">
                <span>{PAYMENT_METHOD_LABELS[method as PaymentMethod] ?? method}</span>
                <b>{formatBRL(value)}</b>
              </div>
            ))}
            {Object.keys(register.summary.inflowsByMethod).length === 0 && (
              <div className="s-dim" style={{ fontSize: 12.5 }}>Nenhum recebimento ainda.</div>
            )}
          </SCard>
        )}
      </div>

      {modal === 'open' && (
        <MoneyPromptModal
          title="Abrir caixa"
          label="Saldo inicial / troco (R$)"
          submitLabel="Abrir caixa"
          onSubmit={async (value) => {
            try {
              await api.post('/cash-register/open', { openingBalance: value });
              invalidate();
              setModal('none');
              toast('Caixa aberto');
            } catch (error) {
              toast(apiErrorMessage(error), 'danger');
            }
          }}
          onClose={() => setModal('none')}
        />
      )}
      {modal === 'move' && (
        <CashMoveModal
          onDone={() => {
            invalidate();
            setModal('none');
          }}
          onClose={() => setModal('none')}
        />
      )}
      {modal === 'close' && register && (
        <CloseRegisterModal
          expected={Number(register.summary?.expectedCash ?? 0)}
          onDone={() => {
            invalidate();
            setModal('none');
          }}
          onClose={() => setModal('none')}
        />
      )}
    </div>
  );
}

function MoneyPromptModal({
  title,
  label,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string;
  label: string;
  submitLabel: string;
  onSubmit: (value: number) => void;
  onClose: () => void;
}) {
  const [raw, setRaw] = useState('');
  const value = parseMoney(raw);
  const valid = Number.isFinite(value) && value >= 0;
  return (
    <SModal title={title} onClose={onClose} width={380}>
      <div className="s-label">{label}</div>
      <div className="s-input">
        <input
          autoFocus
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="0,00"
          onKeyDown={(e) => e.key === 'Enter' && valid && onSubmit(value)}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <SBtn ghost onClick={onClose}>Voltar</SBtn>
        <SBtn primary disabled={!valid} onClick={() => onSubmit(value)}>{submitLabel}</SBtn>
      </div>
    </SModal>
  );
}

function CashMoveModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const toast = useToast();
  const [type, setType] = useState<CashMovementType>(CashMovementType.PULL);
  const [raw, setRaw] = useState('');
  const [description, setDescription] = useState('');
  const value = parseMoney(raw);
  const valid = Number.isFinite(value) && value > 0 && description.trim().length > 0;

  const save = useMutation({
    mutationFn: async () =>
      (await api.post('/cash-register/movements', { type, amount: value, description })).data,
    onSuccess: () => {
      toast(type === CashMovementType.PULL ? 'Sangria registrada' : 'Movimento registrado');
      onDone();
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SModal title="Movimento de caixa" onClose={onClose} width={420}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {([CashMovementType.PULL, CashMovementType.FLOAT, CashMovementType.OUTFLOW] as const).map((t) => (
          <SChip key={t} active={type === t} onClick={() => setType(t)}>
            {CASH_MOVEMENT_LABELS[t]}
          </SChip>
        ))}
      </div>
      <div className="s-label">Valor (R$)</div>
      <div className="s-input" style={{ marginBottom: 10 }}>
        <input autoFocus value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="0,00" />
      </div>
      <div className="s-label">Descrição</div>
      <div className="s-input">
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={type === CashMovementType.PULL ? 'ex.: depósito no banco' : 'ex.: reforço de troco'}
        />
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <SBtn ghost onClick={onClose}>Voltar</SBtn>
        <SBtn primary disabled={!valid || save.isPending} onClick={() => save.mutate()}>Registrar</SBtn>
      </div>
    </SModal>
  );
}

function CloseRegisterModal({
  expected,
  onDone,
  onClose,
}: {
  expected: number;
  onDone: () => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [raw, setRaw] = useState('');
  const counted = parseMoney(raw);
  const valid = Number.isFinite(counted) && counted >= 0;
  const difference = valid ? counted - expected : null;

  const close = useMutation({
    mutationFn: async () =>
      (await api.post<CashRegister>('/cash-register/close', { countedBalance: counted })).data,
    onSuccess: (closed) => {
      const diff = Number(closed.difference);
      toast(
        diff === 0
          ? 'Caixa fechado — diferença zero ✓'
          : `Caixa fechado — ${diff > 0 ? 'sobra' : 'falta'} de ${formatBRL(Math.abs(diff))}`,
        diff === 0 ? 'info' : 'warn',
      );
      onDone();
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SModal title="Fechar caixa (conferência — BR-06)" onClose={onClose} width={400}>
      <div className="s-kv">
        <span>Dinheiro esperado na gaveta</span>
        <b>{formatBRL(expected)}</b>
      </div>
      <div className="s-label" style={{ marginTop: 10 }}>Saldo contado (R$)</div>
      <div className="s-input">
        <input
          autoFocus
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          placeholder="0,00"
          onKeyDown={(e) => e.key === 'Enter' && valid && close.mutate()}
        />
      </div>
      {difference !== null && (
        <div className="s-kv is-troco" style={{ marginTop: 8 }}>
          <span>Diferença</span>
          <b style={{ color: difference === 0 ? 'var(--ok)' : difference < 0 ? 'var(--danger)' : undefined }}>
            {formatBRL(difference)}
          </b>
        </div>
      )}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <SBtn ghost onClick={onClose}>Voltar</SBtn>
        <SBtn primary disabled={!valid || close.isPending} onClick={() => close.mutate()}>
          Fechar caixa
        </SBtn>
      </div>
    </SModal>
  );
}

// ---------- Fiado / contas a receber (FR-30) ----------

function ReceivablesTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [settling, setSettling] = useState<Receivable | null>(null);

  const { data: receivables = [] } = useQuery({
    queryKey: ['receivables', 'open'],
    queryFn: async () => (await api.get<Receivable[]>('/receivables')).data,
  });

  const settle = useMutation({
    mutationFn: async ({ id, method }: { id: string; method: PaymentMethod }) =>
      (await api.post(`/receivables/${id}/settle`, { paymentMethod: method })).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['receivables'] });
      void queryClient.invalidateQueries({ queryKey: ['cash-register'] });
      toast('Recebimento registrado');
      setSettling(null);
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  const totalOpen = receivables.reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <SCard pad={8} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px 4px' }}>
        <div className="s-card-title" style={{ margin: 0 }}>Fiado em aberto</div>
        <STag tone="accent">total: {formatBRL(totalOpen)}</STag>
      </div>
      <STable
        cols={['Cliente', 'Venda', 'Criado em', 'Vencimento', 'Valor', '']}
        widths="1fr 90px 110px 110px 100px 110px"
        align={[null, null, null, null, 'right', 'right']}
        dense
        emptyText="Nenhum fiado em aberto ✓"
        rows={receivables.map((r) => ({
          key: r.id,
          cells: [
            r.customer.name,
            r.sale ? `#${r.sale.id.slice(-6).toUpperCase()}` : '—',
            formatDate(r.createdAt),
            r.dueDate ? formatDate(r.dueDate) : '—',
            <b key="v">{formatBRL(r.amount)}</b>,
            <SBtn key="b" ghost onClick={() => setSettling(r)}>Receber</SBtn>,
          ],
        }))}
      />
      {settling && (
        <SModal title={`Receber de ${settling.customer.name}`} onClose={() => setSettling(null)} width={380}>
          <div className="s-kv">
            <span>Valor</span>
            <b>{formatBRL(settling.amount)}</b>
          </div>
          <div className="s-label" style={{ marginTop: 10 }}>Forma de recebimento</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {([PaymentMethod.CASH, PaymentMethod.PIX, PaymentMethod.CARD] as const).map((m) => (
              <SBtn key={m} ghost onClick={() => settle.mutate({ id: settling.id, method: m })}>
                {PAYMENT_METHOD_LABELS[m]}
              </SBtn>
            ))}
          </div>
        </SModal>
      )}
    </SCard>
  );
}

// ---------- Contas a pagar (FR-31) ----------

function PayablesTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);

  const { data: payables = [] } = useQuery({
    queryKey: ['payables', 'open'],
    queryFn: async () => (await api.get<Payable[]>('/payables')).data,
  });

  const pay = useMutation({
    mutationFn: async (id: string) => (await api.post(`/payables/${id}/pay`)).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['payables'] });
      void queryClient.invalidateQueries({ queryKey: ['financial'] });
      toast('Conta paga — saída registrada no fluxo');
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SCard pad={8} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px 4px' }}>
        <div className="s-card-title" style={{ margin: 0 }}>Contas em aberto</div>
        <SBtn primary onClick={() => setCreating(true)}>+ Nova conta</SBtn>
      </div>
      <STable
        cols={['Descrição', 'Fornecedor', 'Categoria', 'Vencimento', 'Valor', '']}
        widths="1fr 140px 130px 110px 100px 100px"
        align={[null, null, null, null, 'right', 'right']}
        dense
        emptyText="Nenhuma conta em aberto ✓"
        rows={payables.map((p) => {
          const overdue = new Date(p.dueDate) < new Date();
          return {
            key: p.id,
            cells: [
              p.description,
              p.supplier ?? '—',
              p.category?.name ?? '—',
              overdue ? <STag key="d" tone="danger">{formatDate(p.dueDate)}</STag> : formatDate(p.dueDate),
              <b key="v">{formatBRL(p.amount)}</b>,
              <SBtn key="b" ghost onClick={() => pay.mutate(p.id)}>Pagar</SBtn>,
            ],
          };
        })}
      />
      {creating && (
        <PayableModal
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: ['payables'] });
            setCreating(false);
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </SCard>
  );
}

function PayableModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const toast = useToast();
  const [description, setDescription] = useState('');
  const [supplier, setSupplier] = useState('');
  const [raw, setRaw] = useState('');
  const [dueDate, setDueDate] = useState(toDateInput(new Date()));
  const [categoryId, setCategoryId] = useState('');
  const { data: categories = [] } = useCategories('EXPENSE');

  const amount = parseMoney(raw);
  const valid = description.trim().length > 0 && Number.isFinite(amount) && amount > 0 && dueDate;

  const save = useMutation({
    mutationFn: async () =>
      (await api.post('/payables', {
        description,
        supplier: supplier || undefined,
        amount,
        dueDate: new Date(dueDate),
        categoryId: categoryId || undefined,
      })).data,
    onSuccess: () => {
      toast('Conta registrada');
      onDone();
    },
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SModal title="Nova conta a pagar" onClose={onClose} width={460}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div className="s-label">Descrição</div>
          <div className="s-input"><input autoFocus value={description} onChange={(e) => setDescription(e.target.value)} /></div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="s-label">Fornecedor — opcional</div>
            <div className="s-input"><input value={supplier} onChange={(e) => setSupplier(e.target.value)} /></div>
          </div>
          <div style={{ width: 130 }}>
            <div className="s-label">Valor (R$)</div>
            <div className="s-input"><input value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="0,00" /></div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ flex: 1 }}>
            <div className="s-label">Vencimento</div>
            <div className="s-input"><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
          </div>
          <div style={{ flex: 1 }}>
            <div className="s-label">Categoria</div>
            <div className="s-input">
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <SBtn ghost onClick={onClose}>Voltar</SBtn>
          <SBtn primary disabled={!valid || save.isPending} onClick={() => save.mutate()}>Salvar</SBtn>
        </div>
      </div>
    </SModal>
  );
}

// ---------- Fluxo de caixa + lançamentos (FR-28/29/35) ----------

function EntriesTab() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const now = new Date();
  const [from, setFrom] = useState(toDateInput(new Date(now.getFullYear(), now.getMonth(), 1)));
  const [to, setTo] = useState(toDateInput(now));
  const [creating, setCreating] = useState(false);

  const { data } = useQuery({
    queryKey: ['financial', 'cash-flow', from, to],
    queryFn: async () =>
      (await api.get<{
        movements: CashMovement[];
        inflows: number;
        outflows: number;
        balance: number;
      }>('/financial/cash-flow', { params: { from, to: `${to}T23:59:59` } })).data,
  });

  return (
    <>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
        <div>
          <div className="s-label">De</div>
          <div className="s-input"><input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
        </div>
        <div>
          <div className="s-label">Até</div>
          <div className="s-input"><input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <span style={{ flex: 1 }} />
        <SBtn primary onClick={() => setCreating(true)}>+ Lançamento avulso</SBtn>
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <SStat label="Entradas" value={formatBRL(data?.inflows)} />
        <SStat label="Saídas" value={formatBRL(data?.outflows)} />
        <SStat label="Saldo do período" value={formatBRL(data?.balance)} accent />
      </div>
      <SCard pad={8} style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
        <STable
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
              <b key="v" style={{ color: m.type === 'OUTFLOW' ? 'var(--danger)' : undefined }}>
                {m.type === 'INFLOW' ? '+' : '−'}{formatBRL(m.amount)}
              </b>,
            ],
          }))}
        />
      </SCard>
      {creating && (
        <ManualEntryModal
          onDone={() => {
            void queryClient.invalidateQueries({ queryKey: ['financial'] });
            setCreating(false);
            toast('Lançamento registrado');
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  );
}

function ManualEntryModal({ onDone, onClose }: { onDone: () => void; onClose: () => void }) {
  const toast = useToast();
  const [kind, setKind] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [raw, setRaw] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { data: categories = [] } = useCategories(kind);

  const amount = parseMoney(raw);
  const valid = Number.isFinite(amount) && amount > 0 && description.trim().length > 0;

  const save = useMutation({
    mutationFn: async () =>
      (await api.post('/financial/entries', {
        kind,
        amount,
        description,
        categoryId: categoryId || undefined,
      })).data,
    onSuccess: onDone,
    onError: (error) => toast(apiErrorMessage(error), 'danger'),
  });

  return (
    <SModal title="Lançamento avulso (FR-35)" onClose={onClose} width={420}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <SChip active={kind === 'EXPENSE'} onClick={() => setKind('EXPENSE')}>Despesa</SChip>
        <SChip active={kind === 'INCOME'} onClick={() => setKind('INCOME')}>Receita</SChip>
      </div>
      <div className="s-label">Valor (R$)</div>
      <div className="s-input" style={{ marginBottom: 10 }}>
        <input autoFocus value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="0,00" />
      </div>
      <div className="s-label">Descrição</div>
      <div className="s-input" style={{ marginBottom: 10 }}>
        <input value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="s-label">Categoria</div>
      <div className="s-input">
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">—</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 14 }}>
        <SBtn ghost onClick={onClose}>Voltar</SBtn>
        <SBtn primary disabled={!valid || save.isPending} onClick={() => save.mutate()}>Registrar</SBtn>
      </div>
    </SModal>
  );
}

function useCategories(kind: 'INCOME' | 'EXPENSE') {
  return useQuery({
    queryKey: ['financial', 'categories', kind],
    queryFn: async () =>
      (await api.get<FinancialCategory[]>('/financial/categories')).data.filter(
        (c) => c.kind === kind,
      ),
  });
}
