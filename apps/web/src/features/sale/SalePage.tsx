import { useHotkey } from '@tanstack/react-hotkeys';
import { useEffect, useReducer, useRef, useState } from 'react';
import {
  DiscountType,
  PaymentMethod,
  saleCode,
  type CompleteSaleInput,
  type DiscountInput,
} from '@beverage/shared';
import { Button } from '@/components/Button';
import { Confirm } from '@/components/Confirm';
import { Modal } from '@/components/Modal';
import { Screen } from '@/components/Screen';
import { Tag } from '@/components/Tag';
import { toast } from '@/components/Toast';
import { formatBRL, maskBRL, parseMoney } from '@/lib/format';
import { useSession } from '@/lib/session';
import type { Product } from '@/features/products/api';
import type { AddSaleItemInput, Customer, Sale, SaleItem } from './api';
import { CashPanel, CreditPanel, PaymentTiles, SaleChargesCard, SaleTotalCard } from './Checkout';
import { CustomerModal } from './CustomerModal';
import { DiscountModal } from './DiscountModal';
import { SALE_HOTKEYS, SaleHotkeyStrip } from './hotkeys';
import { ReceiptModal } from './ReceiptModal';
import { parseScan, salePricing } from './sale';
import { SaleItemsCard } from './SaleItemsCard';
import { ScanBox } from './ScanBox';
import { SearchModal } from './SearchModal';
import { useSaleFlow } from './useSaleFlow';

type ModalState =
  | { kind: 'none' }
  | { kind: 'search'; initialQuery?: string }
  | { kind: 'discount' }
  | { kind: 'customer' }
  | { kind: 'confirm-cancel' }
  | { kind: 'receipt'; sale: Sale };

export function SalePage() {
  const operatorName = useSession()?.user.name;
  const scanRef = useRef<HTMLInputElement>(null);
  const [focusRequest, requestFocus] = useReducer((n: number) => n + 1, 0);
  const flow = useSaleFlow({ onSettled: requestFocus });

  const [scan, setScan] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lastAddedId, setLastAddedId] = useState<string | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [withInvoice, setWithInvoice] = useState(true);
  const [received, setReceived] = useState('');
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const modalOpen = modal.kind !== 'none';

  // O campo de código volta a ter foco ao fim de cada operação e ao fechar um modal.
  useEffect(() => {
    if (!modalOpen) scanRef.current?.focus();
  }, [focusRequest, modalOpen]);

  // FR-09: abre ou retoma a venda em andamento. A fila do flow serializa a
  // dupla montagem do StrictMode, então não há duas vendas abertas.
  useEffect(() => {
    void flow.open();
  }, []);

  const sale = flow.sale;
  const items = sale?.items ?? [];
  // Total e Taxa de serviço vêm da Venda; só o troco depende do valor ainda não enviado.
  const amountPaid = parseMoney(received);
  const change =
    sale && payment === PaymentMethod.CASH && Number.isFinite(amountPaid)
      ? salePricing(sale, amountPaid).change
      : null;
  const selected = items.find((item) => item.id === selectedId) ?? items.at(-1) ?? null;

  function resetCheckout() {
    setPayment(PaymentMethod.CASH);
    setWithInvoice(true);
    setReceived('');
    setCustomer(null);
    setSelectedId(null);
    setLastAddedId(null);
  }

  async function addItem(input: AddSaleItemInput) {
    if (!sale || flow.busy) return;
    const result = await flow.addItem(input);
    if (result.status === 'added') {
      setLastAddedId(result.itemId);
      setSelectedId(result.itemId);
    } else if (result.status === 'not-found') {
      // FR-11: sem cadastro exato para o código, cai na busca por nome.
      setScan('');
      setModal({ kind: 'search', initialQuery: input.code });
    }
  }

  function submitScan() {
    const input = parseScan(scan);
    if (!input || !sale || flow.busy) return;
    void addItem(input);
    setScan('');
  }

  function pickProduct(product: Product) {
    if (!sale || flow.busy) return;
    void addItem({ code: product.id });
    setScan('');
  }

  async function removeItem(item: SaleItem) {
    const confirmed = await Confirm.call({
      title: 'Remover item?',
      message: `Remover "${item.product.name}" da venda?`,
      confirmLabel: 'Remover',
      danger: true,
    });
    if (!confirmed) return;
    const updated = await flow.removeItem(item.id);
    if (updated) setSelectedId(updated.items.at(-1)?.id ?? null);
  }

  async function applyDiscount(discount: DiscountInput | null) {
    if (await flow.setDiscount(discount)) setModal({ kind: 'none' });
  }

  // FR-21: cancela a venda em andamento e já abre outra.
  async function cancelSale() {
    if (!(await flow.cancel())) return;
    resetCheckout();
    setModal({ kind: 'none' });
    toast('Venda cancelada');
  }

  function prepareCompletion(current: Sale): CompleteSaleInput | null {
    if (current.items.length === 0) {
      toast('Adicione itens antes de finalizar', 'warn');
      return null;
    }
    const amountPaid = parseMoney(received);
    if (payment === PaymentMethod.CASH && !(amountPaid >= current.total)) {
      toast('Informe o valor recebido (maior ou igual ao total)', 'warn');
      return null;
    }
    if (payment === PaymentMethod.CREDIT && !customer) {
      setModal({ kind: 'customer' });
      return null;
    }
    return {
      paymentMethod: payment,
      withInvoice,
      ...(payment === PaymentMethod.CASH ? { amountPaid } : {}),
      ...(payment === PaymentMethod.CREDIT ? { customerId: customer?.id } : {}),
    };
  }

  async function finalize() {
    if (!sale) {
      toast('Adicione itens antes de finalizar', 'warn');
      return;
    }
    const completed = await flow.complete(prepareCompletion);
    if (!completed) return;
    setModal({ kind: 'receipt', sale: completed });
    resetCheckout();
  }

  function selectPayment(method: PaymentMethod) {
    setPayment(method);
    if (method === PaymentMethod.CREDIT && !customer) setModal({ kind: 'customer' });
    requestFocus();
  }

  const closeModal = () => setModal({ kind: 'none' });

  // ignoreInputs: false — o campo de código vive focado (NFR-12).
  const hk = { ignoreInputs: false, enabled: !modalOpen } as const;
  useHotkey(SALE_HOTKEYS.search.key, () => setModal({ kind: 'search' }), hk);
  useHotkey(SALE_HOTKEYS.discount.key, () => setModal({ kind: 'discount' }), hk);
  useHotkey(SALE_HOTKEYS.cash.key, () => setPayment(PaymentMethod.CASH), hk);
  useHotkey(SALE_HOTKEYS.pix.key, () => setPayment(PaymentMethod.PIX), hk);
  useHotkey(SALE_HOTKEYS.card.key, () => setPayment(PaymentMethod.CARD), hk);
  useHotkey(SALE_HOTKEYS.customer.key, () => setModal({ kind: 'customer' }), hk);
  useHotkey(SALE_HOTKEYS.finalize.key, () => void finalize(), hk);
  useHotkey(SALE_HOTKEYS.remove.key, () => selected && void removeItem(selected), {
    ...hk,
    enabled: !modalOpen && scan === '',
  });
  useHotkey(
    SALE_HOTKEYS.cancel.key,
    () => {
      if (modalOpen) closeModal();
      else if (items.length > 0) setModal({ kind: 'confirm-cancel' });
    },
    { ignoreInputs: false },
  );

  const discountLabel = sale?.discountValue
    ? sale.discountType === DiscountType.PERCENT
      ? `${sale.discountValue}%`
      : formatBRL(sale.discountValue)
    : '—';

  return (
    <Screen
      title="Frente de Caixa"
      topRight={
        <>
          {sale ? <Tag tone="accent">{`Venda #${saleCode(sale.id)} em andamento`}</Tag> : null}
          <Tag tone="dim">Operador: {operatorName ?? '—'}</Tag>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_332px] gap-4 h-full">
        <div className="flex flex-col gap-3 min-w-0">
          <ScanBox
            inputRef={scanRef}
            value={scan}
            onChange={setScan}
            onSubmit={submitScan}
            onPick={pickProduct}
          />
          <SaleItemsCard
            items={items}
            pendingQty={flow.pendingQty}
            lastAddedId={lastAddedId}
            selectedItemId={selected?.id ?? null}
            onSelect={setSelectedId}
            onStep={(item, delta) => flow.stepQuantity(item.id, item.quantity, delta)}
            onSetQuantity={(item, quantity) => flow.setQuantity(item.id, quantity)}
            onQuantityDone={() => void flow.commitQuantities()}
            onRemove={(item) => void removeItem(item)}
          />
          <SaleHotkeyStrip />
        </div>

        <div className="flex flex-col gap-2.5">
          <SaleTotalCard
            total={sale?.total ?? 0}
            itemCount={items.reduce((acc, item) => acc + item.quantity, 0)}
            productCount={items.length}
          />
          <SaleChargesCard
            discountLabel={discountLabel}
            serviceFee={sale?.serviceFee ?? null}
            onToggleServiceFee={(on) => void flow.setServiceFee(on)}
            withInvoice={withInvoice}
            onToggleInvoice={setWithInvoice}
          />
          <PaymentTiles payment={payment} onSelect={selectPayment} />
          {payment === PaymentMethod.CASH ? (
            <CashPanel
              received={received}
              onReceivedChange={(value) => setReceived(maskBRL(value))}
              onEnter={() => void finalize()}
              change={change}
            />
          ) : null}
          {payment === PaymentMethod.CREDIT ? (
            <CreditPanel
              customer={customer}
              onOpenCustomer={() => setModal({ kind: 'customer' })}
            />
          ) : null}
          <div className="flex-1" />
          <Button
            primary
            big
            kbd={SALE_HOTKEYS.finalize.label}
            onClick={() => void finalize()}
            disabled={flow.completing}
          >
            {flow.completing ? 'Finalizando…' : 'Finalizar venda'}
          </Button>
          <Button
            ghost
            danger
            kbd={SALE_HOTKEYS.cancel.label}
            onClick={() => items.length > 0 && setModal({ kind: 'confirm-cancel' })}
          >
            Cancelar venda
          </Button>
        </div>
      </div>

      {modal.kind === 'search' ? (
        <SearchModal
          initialQuery={modal.initialQuery}
          onPick={(product) => {
            void addItem({ code: product.id });
            closeModal();
          }}
          onClose={closeModal}
        />
      ) : null}
      {modal.kind === 'discount' ? (
        <DiscountModal onApply={(discount) => void applyDiscount(discount)} onClose={closeModal} />
      ) : null}
      {modal.kind === 'customer' ? (
        <CustomerModal
          onPick={(picked) => {
            setCustomer(picked);
            setPayment(PaymentMethod.CREDIT);
            closeModal();
          }}
          onClose={closeModal}
        />
      ) : null}
      {modal.kind === 'confirm-cancel' ? (
        <Modal title="Cancelar venda em andamento?" onClose={closeModal}>
          <div className="s-dim text-[13.5px] mb-4">
            Os itens bipados serão descartados. Nenhum estoque ou valor foi movimentado (FR-21).
          </div>
          <div className="flex gap-2 justify-end">
            <Button ghost onClick={closeModal}>
              Voltar
            </Button>
            <Button danger onClick={() => void cancelSale()}>
              Cancelar venda
            </Button>
          </div>
        </Modal>
      ) : null}
      {modal.kind === 'receipt' ? (
        <ReceiptModal
          sale={modal.sale}
          onClose={() => {
            closeModal();
            void flow.open();
          }}
        />
      ) : null}
    </Screen>
  );
}
