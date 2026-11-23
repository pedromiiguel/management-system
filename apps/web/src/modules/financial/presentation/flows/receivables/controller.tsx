import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from '@presentation/utils/toast';
import { receivablesQuery, useSettleReceivable } from '@modules/financial/main/financial-queries';
import type { IReceivable } from '../../../domain/financial-model';
import { SETTLED_MESSAGE } from './constants';
import { ReceivablesLayout } from './layout';
import type { TSettleMethod } from './types';

export function ReceivablesController() {
  const [settlingState, setSettlingState] = useState<IReceivable | null>(null);
  const { data: receivables = [] } = useQuery(receivablesQuery());
  const settle = useSettleReceivable();

  const handleSettleMethodClick = (receivable: IReceivable, paymentMethod: TSettleMethod) =>
    settle.mutate(
      { id: receivable.id, input: { paymentMethod } },
      {
        onSuccess: () => {
          toast(SETTLED_MESSAGE);
          setSettlingState(null);
        },
      },
    );

  return (
    <ReceivablesLayout
      receivables={receivables}
      totalOpen={receivables.reduce((sum, receivable) => sum + receivable.amount, 0)}
      settling={settlingState}
      onReceiveClick={setSettlingState}
      onSettleMethodClick={handleSettleMethodClick}
      onSettleClose={() => setSettlingState(null)}
    />
  );
}
