import { Button } from '@/presentation/components/Button';
import { Card } from '@/presentation/components/Card';
import type { CreditPanelProps } from './CreditPanel.types';

export function CreditPanel({ customer, onOpenCustomer }: CreditPanelProps) {
  return (
    <Card pad={12}>
      <div className="s-kv">
        <span>Cliente</span>
        <b data-testid="sale-selected-customer">{customer?.name ?? '—'}</b>
      </div>
      {/* inline: .s-btn não aceita className; width/margin ficam no style prop do DS */}
      <Button ghost style={{ width: '100%', marginTop: 6 }} onClick={onOpenCustomer}>
        {customer ? 'Trocar cliente' : 'Selecionar cliente'}
      </Button>
    </Card>
  );
}
