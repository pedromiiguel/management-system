import { useHotkey } from '@tanstack/react-hotkeys';
import { useEffect, useReducer, useRef, useState } from 'react';
import { PaymentMethod, type CompleteSaleBody, type DiscountInput } from '@beverage/shared';
import { maskBRL, parseMoney } from '@presentation/utils/format';
import { toast } from '@presentation/utils/toast';
import { useSession } from '@modules/auth/main/session';
import type { IProduct } from '@modules/products/domain/product-model';
import type {
  ICustomer,
  ISale,
  ISaleItem,
  TAddSaleItemInput,
} from '@modules/sale/domain/sale-model';
import { salePricing } from '@modules/sale/domain/sale-pricing';
import {
  CASH_MISSING_MESSAGE,
  EMPTY_SALE_MESSAGE,
  SALE_CANCELLED_MESSAGE,
  SALE_HOTKEYS,
} from './constants';
import { SaleLayout } from './layout';
import type { TModalState } from './types';
import { useSaleFlow } from './use-sale-flow';
import { discountLabel, parseScan } from './utils';

/** Frente de caixa (PDV): a venda em andamento, o pagamento e os atalhos. */
export function SaleController() {
  const operatorName = useSession()?.user.name;
  const scanRef = useRef<HTMLInputElement>(null);
  const [focusRequest, requestFocus] = useReducer((n: number) => n + 1, 0);
  const flow = useSaleFlow({ onSettled: requestFocus });

  const [scanState, setScanState] = useState('');
  const [selectedIdState, setSelectedIdState] = useState<string | null>(null);
  const [lastAddedIdState, setLastAddedIdState] = useState<string | null>(null);
  const [paymentState, setPaymentState] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [withInvoiceState, setWithInvoiceState] = useState(true);
  const [receivedState, setReceivedState] = useState('');
  const [customerState, setCustomerState] = useState<ICustomer | null>(null);
  const [modalState, setModalState] = useState<TModalState>({ kind: 'none' });
  const modalOpen = modalState.kind !== 'none';

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
  const amountPaid = parseMoney(receivedState);
  const change =
    sale && paymentState === PaymentMethod.CASH && Number.isFinite(amountPaid)
      ? salePricing(sale, amountPaid).change
      : null;
  const selected = items.find((item) => item.id === selectedIdState) ?? items.at(-1) ?? null;

  function resetCheckout() {
    setPaymentState(PaymentMethod.CASH);
    setWithInvoiceState(true);
    setReceivedState('');
    setCustomerState(null);
    setSelectedIdState(null);
    setLastAddedIdState(null);
  }

  const closeModal = () => setModalState({ kind: 'none' });

  async function addItem(input: TAddSaleItemInput) {
    if (!sale || flow.busy) return;
    const result = await flow.addItem(input);
    if (result.status === 'added') {
      setLastAddedIdState(result.itemId);
      setSelectedIdState(result.itemId);
    } else if (result.status === 'not-found') {
      // FR-11: sem cadastro exato para o código, cai na busca por nome.
      setScanState('');
      setModalState({ kind: 'search', initialQuery: input.code });
    }
  }

  function handleScanSubmit() {
    const input = parseScan(scanState);
    if (!input || !sale || flow.busy) return;
    void addItem(input);
    setScanState('');
  }

  function handleSuggestionPick(product: IProduct) {
    if (!sale || flow.busy) return;
    void addItem({ code: product.id });
    setScanState('');
  }

  /** Remover pede confirmação num modal do PDV (hotkeys e foco seguem os demais modais). */
  function askRemoveItem(item: ISaleItem) {
    setModalState({ kind: 'confirm-remove', item });
  }

  async function handleRemoveConfirm(item: ISaleItem) {
    closeModal();
    const updated = await flow.removeItem(item.id);
    if (updated) setSelectedIdState(updated.items.at(-1)?.id ?? null);
  }

  async function handleDiscountApply(discount: DiscountInput | null) {
    if (await flow.setDiscount(discount)) closeModal();
  }

  /** Cancelar só pede confirmação quando há itens. */
  function askCancelSale() {
    if (items.length > 0) setModalState({ kind: 'confirm-cancel' });
  }

  // FR-21: cancela a venda em andamento e já abre outra.
  async function handleCancelConfirm() {
    if (!(await flow.cancel())) return;
    resetCheckout();
    closeModal();
    toast(SALE_CANCELLED_MESSAGE);
  }

  function prepareCompletion(current: ISale): CompleteSaleBody | null {
    if (current.items.length === 0) {
      toast(EMPTY_SALE_MESSAGE, 'warn');
      return null;
    }
    const paid = parseMoney(receivedState);
    if (paymentState === PaymentMethod.CASH && !(paid >= current.total)) {
      toast(CASH_MISSING_MESSAGE, 'warn');
      return null;
    }
    if (paymentState === PaymentMethod.CREDIT && !customerState) {
      setModalState({ kind: 'customer' });
      return null;
    }
    return {
      paymentMethod: paymentState,
      withInvoice: withInvoiceState,
      ...(paymentState === PaymentMethod.CASH ? { amountPaid: paid } : {}),
      ...(paymentState === PaymentMethod.CREDIT ? { customerId: customerState?.id } : {}),
    };
  }

  async function finalize() {
    if (flow.completing) return;
    if (!sale) {
      toast(EMPTY_SALE_MESSAGE, 'warn');
      return;
    }
    const completed = await flow.complete(prepareCompletion);
    if (!completed) return;
    setModalState({ kind: 'receipt', sale: completed });
    resetCheckout();
  }

  function handlePaymentSelect(method: PaymentMethod) {
    setPaymentState(method);
    if (method === PaymentMethod.CREDIT && !customerState) setModalState({ kind: 'customer' });
    requestFocus();
  }

  function handleCustomerPick(picked: ICustomer) {
    setCustomerState(picked);
    setPaymentState(PaymentMethod.CREDIT);
    closeModal();
  }

  /** Fechar o cupom (Enter, Esc, botão ou clique fora) já abre a próxima venda. */
  function startNextSale() {
    closeModal();
    void flow.open();
  }

  /** Esc: fecha o modal aberto — no cupom, isso é começar a próxima venda. */
  function dismissModal() {
    if (modalState.kind === 'receipt') startNextSale();
    else closeModal();
  }

  /** Del só vale no campo de código (ou fora de campos), nunca digitando em outro input. */
  function removeSelectedFromHotkey() {
    const focused = document.activeElement;
    const typing =
      focused instanceof HTMLInputElement ||
      focused instanceof HTMLTextAreaElement ||
      focused instanceof HTMLSelectElement;
    if (typing && focused !== scanRef.current) return;
    if (selected) askRemoveItem(selected);
  }

  // ignoreInputs: false — o campo de código vive focado (NFR-12).
  const hk = { ignoreInputs: false, enabled: !modalOpen } as const;
  useHotkey(SALE_HOTKEYS.search.key, () => setModalState({ kind: 'search' }), hk);
  useHotkey(SALE_HOTKEYS.discount.key, () => setModalState({ kind: 'discount' }), hk);
  useHotkey(SALE_HOTKEYS.cash.key, () => setPaymentState(PaymentMethod.CASH), hk);
  useHotkey(SALE_HOTKEYS.pix.key, () => setPaymentState(PaymentMethod.PIX), hk);
  useHotkey(SALE_HOTKEYS.card.key, () => setPaymentState(PaymentMethod.CARD), hk);
  useHotkey(SALE_HOTKEYS.customer.key, () => setModalState({ kind: 'customer' }), hk);
  useHotkey(SALE_HOTKEYS.finalize.key, () => void finalize(), hk);
  useHotkey(SALE_HOTKEYS.remove.key, removeSelectedFromHotkey, {
    ...hk,
    enabled: !modalOpen && scanState === '',
  });
  useHotkey(
    SALE_HOTKEYS.cancel.key,
    () => {
      if (modalOpen) dismissModal();
      else askCancelSale();
    },
    { ignoreInputs: false },
  );

  return (
    <SaleLayout
      sale={sale}
      items={items}
      operatorName={operatorName}
      showReopen={!sale && !flow.opening && modalState.kind !== 'receipt'}
      modal={modalState}
      scanRef={scanRef}
      scan={scanState}
      onScanChange={setScanState}
      onScanSubmit={handleScanSubmit}
      onSuggestionPick={handleSuggestionPick}
      pendingQty={flow.pendingQty}
      lastAddedId={lastAddedIdState}
      selectedItemId={selected?.id ?? null}
      onItemSelect={setSelectedIdState}
      onQuantityStep={(item, delta) => flow.stepQuantity(item.id, item.quantity, delta)}
      onQuantitySet={(item, quantity) => flow.setQuantity(item.id, quantity)}
      onQuantityDone={() => void flow.commitQuantities()}
      onRemoveClick={askRemoveItem}
      itemCount={items.reduce((acc, item) => acc + item.quantity, 0)}
      discountLabel={discountLabel(sale)}
      onServiceFeeToggle={(on) => void flow.setServiceFee(on)}
      withInvoice={withInvoiceState}
      onInvoiceToggle={setWithInvoiceState}
      payment={paymentState}
      onPaymentSelect={handlePaymentSelect}
      received={receivedState}
      onReceivedChange={(value) => setReceivedState(maskBRL(value))}
      change={change}
      customer={customerState}
      onCustomerOpen={() => setModalState({ kind: 'customer' })}
      completing={flow.completing}
      onFinalize={() => void finalize()}
      onCancelClick={askCancelSale}
      onReopenClick={() => void flow.open()}
      onModalClose={closeModal}
      onSearchPick={(product) => {
        void addItem({ code: product.id });
        closeModal();
      }}
      onDiscountApply={(discount) => void handleDiscountApply(discount)}
      onCustomerPick={handleCustomerPick}
      onCancelConfirm={() => void handleCancelConfirm()}
      onRemoveConfirm={(item) => void handleRemoveConfirm(item)}
      onReceiptClose={startNextSale}
    />
  );
}
