import { useHotkey } from '@tanstack/react-hotkeys';
import { useEffect, useReducer, useRef, useState } from 'react';
import { PaymentMethod, type DiscountInput } from '@beverage/shared';
import { maskBRL, parseMoney } from '@presentation/utils/format';
import { toast } from '@presentation/utils/toast';
import { useSession } from '@modules/auth/main/session';
import type { IProduct } from '@modules/products/domain/product-model';
import type { ICustomer, ISaleItem, TAddSaleItemInput } from '@modules/sale/domain/sale-model';
import { salePricing } from '@modules/sale/domain/sale-pricing';
import type { TCompletionBlock } from '@modules/sale/domain/sale-session';
import {
  CASH_MISSING_MESSAGE,
  EMPTY_SALE_MESSAGE,
  PAYMENT_DISABLED_MESSAGE,
  SALE_CANCELLED_MESSAGE,
  SALE_HOTKEYS,
} from './constants';
import { SaleLayout } from './layout';
import type { TModalState } from './types';
import { useSaleSession } from './use-sale-session';
import { discountLabel, parseScan } from './utils';

/** Frente de caixa (PDV): a venda em andamento, o pagamento e os atalhos. */
export function SaleController() {
  const operatorName = useSession()?.user.name;
  const scanRef = useRef<HTMLInputElement>(null);
  const [focusRequest, requestFocus] = useReducer((n: number) => n + 1, 0);
  const flow = useSaleSession({ onSettled: requestFocus });
  const { session, checkout } = flow;

  const [scanState, setScanState] = useState('');
  const [selectedIdState, setSelectedIdState] = useState<string | null>(null);
  const [lastAddedIdState, setLastAddedIdState] = useState<string | null>(null);
  // Texto do campo "valor recebido"; o valor em si mora no checkout da sessão.
  const [receivedState, setReceivedState] = useState('');
  const received = checkout.amountReceived === null ? '' : receivedState;
  const [modalState, setModalState] = useState<TModalState>({ kind: 'none' });
  const modalOpen = modalState.kind !== 'none';

  // O campo de código volta a ter foco ao fim de cada operação e ao fechar um modal.
  useEffect(() => {
    if (!modalOpen) scanRef.current?.focus();
  }, [focusRequest, modalOpen]);

  // FR-09: abre ou retoma a venda em andamento. A fila do flow serializa a
  // dupla montagem do StrictMode, então não há duas vendas abertas.
  useEffect(() => {
    void session.open();
  }, []);

  const sale = flow.sale;
  const items = sale?.items ?? [];
  // Total e Taxa de serviço vêm da Venda; só o troco depende do valor ainda não enviado.
  const change =
    sale && checkout.payment === PaymentMethod.CASH && checkout.amountReceived !== null
      ? salePricing(sale, checkout.amountReceived).change
      : null;
  const selected = items.find((item) => item.id === selectedIdState) ?? items.at(-1) ?? null;

  /** O checkout volta ao início na própria sessão; aqui, só a seleção da tela. */
  function resetSelection() {
    setSelectedIdState(null);
    setLastAddedIdState(null);
  }

  const closeModal = () => setModalState({ kind: 'none' });

  async function addItem(input: TAddSaleItemInput) {
    if (!sale || flow.busy) return;
    const result = await session.addItem(input);
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
    const updated = await session.removeItem(item.id);
    if (updated) setSelectedIdState(updated.items.at(-1)?.id ?? null);
  }

  async function handleDiscountApply(discount: DiscountInput | null) {
    if (await session.setDiscount(discount)) closeModal();
  }

  /** Cancelar só pede confirmação quando há itens. */
  function askCancelSale() {
    if (items.length > 0) setModalState({ kind: 'confirm-cancel' });
  }

  // FR-21: cancela a venda em andamento e já abre outra.
  async function handleCancelConfirm() {
    if (!(await session.cancel())) return;
    resetSelection();
    closeModal();
    toast(SALE_CANCELLED_MESSAGE);
  }

  /** Por que não concluiu: avisa, ou leva ao passo que falta (cliente do fiado). */
  function explainBlock(reason: TCompletionBlock) {
    if (reason === 'customer-missing') setModalState({ kind: 'customer' });
    else if (reason === 'empty') toast(EMPTY_SALE_MESSAGE, 'warn');
    else if (reason === 'cash-missing') toast(CASH_MISSING_MESSAGE, 'warn');
    else toast(PAYMENT_DISABLED_MESSAGE, 'warn');
  }

  async function finalize() {
    if (flow.completing) return;
    const result = await session.complete();
    if (result.status === 'blocked') explainBlock(result.reason);
    if (result.status !== 'completed') return;
    setModalState({ kind: 'receipt', sale: result.sale });
    resetSelection();
  }

  function handlePaymentSelect(method: PaymentMethod) {
    if (!session.selectPayment(method)) return;
    if (method === PaymentMethod.CREDIT && !checkout.customer) setModalState({ kind: 'customer' });
    requestFocus();
  }

  /** F8: só abre o cliente do fiado quando o Fiado está ligado. */
  function openCustomer() {
    if (flow.enabledPaymentMethods.includes(PaymentMethod.CREDIT)) {
      setModalState({ kind: 'customer' });
    }
  }

  function handleCustomerPick(picked: ICustomer) {
    session.setCustomer(picked);
    closeModal();
  }

  function handleReceivedChange(value: string) {
    const masked = maskBRL(value);
    setReceivedState(masked);
    session.setAmountReceived(masked ? parseMoney(masked) : null);
  }

  /** Fechar o cupom (Enter, Esc, botão ou clique fora) já abre a próxima venda. */
  function startNextSale() {
    closeModal();
    void session.open();
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
  useHotkey(SALE_HOTKEYS.cash.key, () => session.selectPayment(PaymentMethod.CASH), hk);
  useHotkey(SALE_HOTKEYS.pix.key, () => session.selectPayment(PaymentMethod.PIX), hk);
  useHotkey(SALE_HOTKEYS.card.key, () => session.selectPayment(PaymentMethod.CARD), hk);
  useHotkey(SALE_HOTKEYS.customer.key, openCustomer, hk);
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
      onQuantityStep={(item, delta) => session.stepQuantity(item.id, item.quantity, delta)}
      onQuantitySet={(item, quantity) => session.setQuantity(item.id, quantity)}
      onQuantityDone={() => void session.commitQuantities()}
      onRemoveClick={askRemoveItem}
      itemCount={items.reduce((acc, item) => acc + item.quantity, 0)}
      discountLabel={discountLabel(sale)}
      onServiceFeeToggle={(on) => void session.setServiceFee(on)}
      withInvoice={checkout.withInvoice}
      onInvoiceToggle={session.setWithInvoice}
      payment={checkout.payment}
      enabledPayments={flow.enabledPaymentMethods}
      onPaymentSelect={handlePaymentSelect}
      received={received}
      onReceivedChange={handleReceivedChange}
      change={change}
      customer={checkout.customer}
      onCustomerOpen={openCustomer}
      completing={flow.completing}
      onFinalize={() => void finalize()}
      onCancelClick={askCancelSale}
      onReopenClick={() => void session.open()}
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
