import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';
import { Card } from '@/presentation/components/Card';
import { IconButton } from '@/presentation/components/IconButton';
import { Table } from '@/presentation/components/Table';
import { formatBRL } from '@/lib/format';
import { QtyStepper } from '../QtyStepper';
import type { SaleItemsCardProps } from './SaleItemsCard.types';

export function SaleItemsCard({
  items,
  pendingQty,
  lastAddedId,
  selectedItemId,
  onSelectItem,
  onStepQuantity,
  onTypedQuantity,
  onQuantityDone,
  onRemoveItem,
}: SaleItemsCardProps) {
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
            onClick: () => onSelectItem(item.id),
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
                onStep={(delta) => onStepQuantity(item, delta)}
                onTyped={(next) => onTypedQuantity(item, next)}
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
                  onRemoveItem(item);
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
