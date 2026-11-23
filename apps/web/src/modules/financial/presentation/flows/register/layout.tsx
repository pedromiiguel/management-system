import {
  CASH_MOVEMENT_LABELS,
  closeRegisterSchema,
  openRegisterSchema,
  PAYMENT_METHOD_LABELS,
  type PaymentMethod,
} from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Card } from '@presentation/components/Card';
import { Table } from '@presentation/components/Table';
import { Tag } from '@presentation/components/Tag';
import { formatBRL, formatDateTime } from '@presentation/utils/format';
import { CashMovementFormFlow } from './cash-movement-form';
import { ADDS_TO_DRAWER, MOVEMENT_TONES } from './constants';
import { Difference } from './difference';
import { MoneyPrompt } from './money-prompt';
import type { TRegisterLayoutProps } from './types';
import { differenceTone } from './utils';

export function RegisterLayout({
  register,
  history,
  modal,
  isOpening,
  isClosing,
  onOpenClick,
  onMovementClick,
  onCloseClick,
  onOpenSubmit,
  onCloseSubmit,
  onModalClose,
}: TRegisterLayoutProps) {
  const expectedCash = register?.summary?.expectedCash ?? 0;

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
                <Button ghost onClick={onMovementClick}>
                  Sangria / Suprimento
                </Button>
                <Button primary onClick={onCloseClick}>
                  Fechar caixa
                </Button>
              </>
            ) : (
              <Button primary onClick={onOpenClick}>
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
            rows={(register.movements ?? []).map((movement) => ({
              key: movement.id,
              cells: [
                formatDateTime(movement.occurredAt).slice(-5),
                movement.description,
                <Tag tone={MOVEMENT_TONES[movement.type]}>
                  {CASH_MOVEMENT_LABELS[movement.type]}
                </Tag>,
                movement.paymentMethod ? PAYMENT_METHOD_LABELS[movement.paymentMethod] : '—',
                <b>
                  {ADDS_TO_DRAWER.has(movement.type) ? '+' : '−'}
                  {formatBRL(movement.amount)}
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
            rows={history.map((closed) => ({
              key: closed.id,
              cells: [
                formatDateTime(closed.openedAt),
                formatDateTime(closed.closedAt),
                closed.operator.name,
                formatBRL(closed.expectedBalance),
                formatBRL(closed.countedBalance),
                <Tag tone={differenceTone(closed.difference)}>{formatBRL(closed.difference)}</Tag>,
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
        <MoneyPrompt
          title="Abrir caixa"
          label="Saldo inicial / troco (R$)"
          submitLabel="Abrir caixa"
          width={380}
          rule={openRegisterSchema.shape.openingBalance}
          isPending={isOpening}
          onSubmit={onOpenSubmit}
          onClose={onModalClose}
        />
      ) : null}
      {modal === 'movement' ? <CashMovementFormFlow onClose={onModalClose} /> : null}
      {modal === 'close' && register ? (
        <MoneyPrompt
          title="Fechar caixa (conferência — BR-06)"
          label="Saldo contado (R$)"
          submitLabel="Fechar caixa"
          width={400}
          rule={closeRegisterSchema.shape.countedBalance}
          isPending={isClosing}
          header={
            <div className="s-kv">
              <span>Dinheiro esperado na gaveta</span>
              <b>{formatBRL(register.summary?.expectedCash)}</b>
            </div>
          }
          footer={(counted) => <Difference value={counted - expectedCash} />}
          onSubmit={onCloseSubmit}
          onClose={onModalClose}
        />
      ) : null}
    </div>
  );
}
