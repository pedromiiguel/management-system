import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { stockAlertsQuery, stockMovementsQuery } from '@modules/stock/main/stock-queries';
import { StockLayout } from './layout';
import type { TStockModal } from './types';

export function StockController() {
  const [modalState, setModalState] = useState<TStockModal>('none');
  const { data: alerts } = useQuery(stockAlertsQuery());
  const { data: movements = [] } = useQuery(stockMovementsQuery());

  return (
    <StockLayout
      movements={movements}
      alerts={alerts}
      modal={modalState}
      onEntryClick={() => setModalState('entry')}
      onAdjustmentClick={() => setModalState('adjustment')}
      onModalClose={() => setModalState('none')}
    />
  );
}
