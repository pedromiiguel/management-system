import { PaymentMethod, saleCode } from '@beverage/shared';
import { Button } from '@presentation/components/Button';
import { Modal } from '@presentation/components/Modal';
import { Screen } from '@presentation/components/Screen';
import { Tag } from '@presentation/components/Tag';
import {
  CashPanel,
  CreditPanel,
  PaymentTiles,
  SaleChargesCard,
  SaleTotalCard,
} from './components/checkout-cards';
import { SaleHotkeyStrip } from './components/hotkey-strip';
import { ReceiptModal } from './components/receipt-modal';
import { SaleItemsCard } from './components/sale-items-card';
import { SALE_HOTKEYS } from './constants';
import { CustomerModalController as CustomerModal } from './customer-modal/controller';
import { DiscountModalController as DiscountModal } from './discount-modal/controller';
import { ScanBoxController as ScanBox } from './scan-box/controller';
import { SearchModalController as SearchModal } from './search-modal/controller';
import type { TSaleLayoutProps } from './types';

export function SaleLayout({
  sale,
  items,
  operatorName,
  showReopen,
  modal,
  scanRef,
  scan,
  onScanChange,
  onScanSubmit,
  onSuggestionPick,
  pendingQty,
  lastAddedId,
  selectedItemId,
  onItemSelect,
  onQuantityStep,
  onQuantitySet,
  onQuantityDone,
  onRemoveClick,
  itemCount,
  discountLabel,
  onServiceFeeToggle,
  withInvoice,
  onInvoiceToggle,
  payment,
  enabledPayments,
  onPaymentSelect,
  received,
  onReceivedChange,
  change,
  customer,
  onCustomerOpen,
  completing,
  onFinalize,
  onCancelClick,
  onReopenClick,
  onModalClose,
  onSearchPick,
  onDiscountApply,
  onCustomerPick,
  onCancelConfirm,
  onRemoveConfirm,
  onReceiptClose,
}: TSaleLayoutProps) {
  const finalizeLabel = completing ? 'Finalizando…' : 'Finalizar venda';

  return (
    <Screen
      title="Frente de Caixa"
      topRight={
        <>
          {sale ? <Tag tone="accent">{`Venda #${saleCode(sale.id)} em andamento`}</Tag> : null}
          {showReopen ? (
            <>
              <Tag tone="danger">Nenhuma venda aberta</Tag>
              <Button primary onClick={onReopenClick}>
                Abrir venda novamente
              </Button>
            </>
          ) : null}
          <Tag tone="dim">Operador: {operatorName ?? '—'}</Tag>
        </>
      }
    >
      <div className="grid grid-cols-[1fr_332px] gap-4 h-full">
        <div className="flex flex-col gap-3 min-w-0">
          <ScanBox
            inputRef={scanRef}
            value={scan}
            onChange={onScanChange}
            onSubmit={onScanSubmit}
            onPick={onSuggestionPick}
          />
          <SaleItemsCard
            items={items}
            pendingQty={pendingQty}
            lastAddedId={lastAddedId}
            selectedItemId={selectedItemId}
            onSelect={onItemSelect}
            onStep={onQuantityStep}
            onSetQuantity={onQuantitySet}
            onQuantityDone={onQuantityDone}
            onRemove={onRemoveClick}
          />
          <SaleHotkeyStrip />
        </div>

        <div className="flex flex-col gap-2.5">
          <SaleTotalCard
            total={sale?.total ?? 0}
            itemCount={itemCount}
            productCount={items.length}
          />
          <SaleChargesCard
            discountLabel={discountLabel}
            serviceFee={sale?.serviceFee ?? null}
            onToggleServiceFee={onServiceFeeToggle}
            withInvoice={withInvoice}
            onToggleInvoice={onInvoiceToggle}
          />
          <PaymentTiles payment={payment} enabled={enabledPayments} onSelect={onPaymentSelect} />
          {payment === PaymentMethod.CASH ? (
            <CashPanel
              received={received}
              onReceivedChange={onReceivedChange}
              onEnter={onFinalize}
              change={change}
            />
          ) : null}
          {payment === PaymentMethod.CREDIT ? (
            <CreditPanel customer={customer} onOpenCustomer={onCustomerOpen} />
          ) : null}
          <div className="flex-1" />
          <Button
            primary
            big
            kbd={SALE_HOTKEYS.finalize.label}
            onClick={onFinalize}
            disabled={completing}
          >
            {finalizeLabel}
          </Button>
          <Button ghost danger kbd={SALE_HOTKEYS.cancel.label} onClick={onCancelClick}>
            Cancelar venda
          </Button>
        </div>
      </div>

      {modal.kind === 'search' ? (
        <SearchModal
          initialQuery={modal.initialQuery}
          onPick={onSearchPick}
          onClose={onModalClose}
        />
      ) : null}
      {modal.kind === 'discount' ? (
        <DiscountModal onApply={onDiscountApply} onClose={onModalClose} />
      ) : null}
      {modal.kind === 'customer' ? (
        <CustomerModal onPick={onCustomerPick} onClose={onModalClose} />
      ) : null}
      {modal.kind === 'confirm-cancel' ? (
        <Modal title="Cancelar venda em andamento?" onClose={onModalClose}>
          <div className="s-dim text-[13.5px] mb-4">
            Os itens bipados serão descartados. Nenhum estoque ou valor foi movimentado (FR-21).
          </div>
          <div className="flex gap-2 justify-end">
            <Button ghost onClick={onModalClose}>
              Voltar
            </Button>
            <Button danger onClick={onCancelConfirm}>
              Cancelar venda
            </Button>
          </div>
        </Modal>
      ) : null}
      {modal.kind === 'confirm-remove' ? (
        <Modal title="Remover item?" onClose={onModalClose} width={420}>
          <p className="text-[13.5px] mb-[18px]">
            Remover &quot;{modal.item.product.name}&quot; da venda?
          </p>
          <div className="flex gap-2 justify-end">
            <Button ghost onClick={onModalClose}>
              Cancelar
            </Button>
            <Button danger onClick={() => onRemoveConfirm(modal.item)}>
              Remover
            </Button>
          </div>
        </Modal>
      ) : null}
      {modal.kind === 'receipt' ? (
        <ReceiptModal sale={modal.sale} onClose={onReceiptClose} />
      ) : null}
    </Screen>
  );
}
