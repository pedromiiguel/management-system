import type { RefObject } from 'react';
import type { DiscountInput, PaymentMethod } from '@beverage/shared';
import type { IProduct } from '@modules/products/domain/product-model';
import type { ICustomer, ISale, ISaleItem } from '@modules/sale/domain/sale-model';

export type TModalState =
  | { kind: 'none' }
  | { kind: 'search'; initialQuery?: string }
  | { kind: 'discount' }
  | { kind: 'customer' }
  | { kind: 'confirm-cancel' }
  | { kind: 'confirm-remove'; item: ISaleItem }
  | { kind: 'receipt'; sale: ISale };

export type TSaleLayoutProps = {
  sale: ISale | null;
  items: ISaleItem[];
  operatorName: string | undefined;
  /** A abertura falhou: mostra o aviso e o botão de abrir de novo. */
  showReopen: boolean;
  modal: TModalState;

  scanRef: RefObject<HTMLInputElement | null>;
  scan: string;
  onScanChange: (value: string) => void;
  onScanSubmit: () => void;
  onSuggestionPick: (product: IProduct) => void;

  pendingQty: Record<string, number>;
  lastAddedId: string | null;
  selectedItemId: string | null;
  onItemSelect: (itemId: string) => void;
  onQuantityStep: (item: ISaleItem, delta: number) => void;
  onQuantitySet: (item: ISaleItem, quantity: number) => void;
  onQuantityDone: () => void;
  onRemoveClick: (item: ISaleItem) => void;

  itemCount: number;
  discountLabel: string;
  onServiceFeeToggle: (on: boolean) => void;
  withInvoice: boolean;
  onInvoiceToggle: (on: boolean) => void;
  payment: PaymentMethod;
  /** Formas ligadas nas Configurações: só elas aparecem. */
  enabledPayments: readonly PaymentMethod[];
  onPaymentSelect: (method: PaymentMethod) => void;
  received: string;
  onReceivedChange: (value: string) => void;
  change: number | null;
  customer: ICustomer | null;
  onCustomerOpen: () => void;
  completing: boolean;
  onFinalize: () => void;
  onCancelClick: () => void;
  onReopenClick: () => void;

  onModalClose: () => void;
  onSearchPick: (product: IProduct) => void;
  onDiscountApply: (discount: DiscountInput | null) => void;
  onCustomerPick: (customer: ICustomer) => void;
  onCancelConfirm: () => void;
  onRemoveConfirm: (item: ISaleItem) => void;
  onReceiptClose: () => void;
};
