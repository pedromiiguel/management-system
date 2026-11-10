import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/Card';
import { IconButton } from '@/components/IconButton';
import { Table } from '@/components/Table';
import { formatBRL } from '@/lib/format';
import type { SaleItem } from './api';

export function SaleItemsCard({
  items,
  pendingQty,
  lastAddedId,
  selectedItemId,
  onSelect,
  onStep,
  onSetQuantity,
  onQuantityDone,
  onRemove,
}: {
  items: SaleItem[];
  pendingQty: Record<string, number>;
  lastAddedId: string | null;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
  onStep: (item: SaleItem, delta: number) => void;
  onSetQuantity: (item: SaleItem, quantity: number) => void;
  onQuantityDone: () => void;
  onRemove: (item: SaleItem) => void;
}) {
  return (
    <Card pad={8} className="flex flex-col flex-1 min-h-0 overflow-auto">
      <Table
        cols={['#', 'Produto', 'Qtd', 'Unit.', 'Subtotal', '']}
        widths="40px 1fr 108px 100px 110px 44px"
        align={[null, null, 'center', 'right', 'right', 'center']}
        emptyText="Bipe o primeiro produto para começar a venda"
        rows={items.map((item, index) => {
          const quantity = pendingQty[item.id] ?? item.quantity;
          return {
            key: item.id,
            testId: `sale-item-${item.id}`,
            highlight: item.id === lastAddedId,
            onClick: () => onSelect(item.id),
            cells: [
              index + 1,
              <span
                key="n"
                className={clsx(item.id === selectedItemId ? 'font-bold' : 'font-normal')}
              >
                {item.product.name}
              </span>,
              <QtyStepper
                key="q"
                quantity={quantity}
                onStep={(delta) => onStep(item, delta)}
                onTyped={(next) => onSetQuantity(item, next)}
                onDone={onQuantityDone}
              />,
              formatBRL(item.unitPrice),
              <b key="s" data-testid={`sale-item-${item.id}-subtotal`}>
                {formatBRL(item.unitPrice * quantity)}
              </b>,
              <IconButton
                key="del"
                icon={Trash2}
                danger
                title="Remover item"
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove(item);
                }}
              />,
            ],
          };
        })}
      />
      <div className="flex-1" />
      <div className="s-dim text-xs px-2.5 py-2">
        Bipar o mesmo produto soma a quantidade · use +/- ou digite pra alterar a quantidade ·{' '}
        <b>Del</b> remove o item selecionado
      </div>
    </Card>
  );
}

/**
 * Alterar quantidade (FR-14): +/- ou digitação direta. Mantém um texto
 * próprio enquanto se digita (só dígitos) e volta ao valor externo quando
 * ele muda.
 */
function QtyStepper({
  quantity,
  onStep,
  onTyped,
  onDone,
}: {
  quantity: number;
  onStep: (delta: number) => void;
  onTyped: (quantity: number) => void;
  onDone: () => void;
}) {
  const [draft, setDraft] = useState<{ base: number; raw: string } | null>(null);
  const raw = draft && draft.base === quantity ? draft.raw : String(quantity);

  function commit() {
    const parsed = Number(raw);
    if (Number.isInteger(parsed) && parsed > 0) onTyped(parsed);
    setDraft(null);
    onDone();
  }

  return (
    <div className="s-qty-stepper" onClick={(event) => event.stopPropagation()}>
      <button
        type="button"
        disabled={quantity <= 1}
        onClick={() => onStep(-1)}
        aria-label="Diminuir quantidade"
      >
        −
      </button>
      <input
        value={raw}
        inputMode="numeric"
        aria-label="Quantidade"
        onChange={(event) =>
          setDraft({ base: quantity, raw: event.target.value.replace(/\D/g, '') })
        }
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
      />
      <button type="button" onClick={() => onStep(1)} aria-label="Aumentar quantidade">
        +
      </button>
    </div>
  );
}
