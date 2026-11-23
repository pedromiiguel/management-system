import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';
import { Card } from '@presentation/components/Card';
import { IconButton } from '@presentation/components/IconButton';
import { Table } from '@presentation/components/Table';
import { formatBRL } from '@presentation/utils/format';
import type { ISaleItem } from '@modules/sale/domain/sale-model';
import { QtyStepperController as QtyStepper } from '../qty-stepper/controller';

type TSaleItemsCardProps = {
  items: ISaleItem[];
  pendingQty: Record<string, number>;
  lastAddedId: string | null;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
  onStep: (item: ISaleItem, delta: number) => void;
  onSetQuantity: (item: ISaleItem, quantity: number) => void;
  onQuantityDone: () => void;
  onRemove: (item: ISaleItem) => void;
};

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
}: TSaleItemsCardProps) {
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
