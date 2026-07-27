import { CASH_MOVEMENT_LABELS, type CashMovementType, PAYMENT_METHOD_LABELS } from '@beverage/shared';
import { Tag } from '@/presentation/components/Tag';
import { formatBRL, formatDateTime } from '@/lib/format';
import { useRegisterTabModel } from './RegisterTab.model';
import { RegisterTabView } from './RegisterTab.view';
import type { TableRow } from './RegisterTab.types';

export function RegisterTab() {
  const { register, history, modal, setModal, onDone, openRegister } = useRegisterTabModel();

  const movementRows: TableRow[] = (register?.movements ?? []).map((m) => ({
    key: m.id,
    cells: [
      formatDateTime(m.occurredAt).slice(-5),
      m.description,
      <Tag key="t" tone={m.type === 'INFLOW' ? 'ok' : m.type === 'FLOAT' ? 'accent' : 'warn'}>
        {CASH_MOVEMENT_LABELS[m.type as CashMovementType]}
      </Tag>,
      m.paymentMethod ? PAYMENT_METHOD_LABELS[m.paymentMethod] : '—',
      <b key="v">
        {m.type === 'INFLOW' || m.type === 'FLOAT' ? '+' : '−'}
        {formatBRL(m.amount)}
      </b>,
    ],
  }));

  const historyRows: TableRow[] = history.map((r) => ({
    key: r.id,
    cells: [
      formatDateTime(r.openedAt),
      r.closedAt ? formatDateTime(r.closedAt) : '—',
      r.operator.name,
      formatBRL(r.expectedBalance),
      formatBRL(r.countedBalance),
      Number(r.difference) === 0 ? (
        <Tag key="d" tone="ok">R$ 0,00</Tag>
      ) : (
        <Tag key="d" tone={Number(r.difference) > 0 ? 'accent' : 'danger'}>
          {formatBRL(r.difference)}
        </Tag>
      ),
    ],
  }));

  return (
    <RegisterTabView
      register={register}
      movementRows={movementRows}
      historyRows={historyRows}
      modal={modal}
      onOpenModal={setModal}
      onCloseModal={() => setModal('none')}
      onOpenRegister={openRegister}
      onMoved={onDone}
      onClosed={onDone}
    />
  );
}
