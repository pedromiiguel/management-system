import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { dateOnlyKey } from '@beverage/shared';
import { todayKey } from '@presentation/utils/format';
import { toast } from '@presentation/utils/toast';
import { payablesQuery, usePayPayable } from '@modules/financial/main/financial-queries';
import type { IPayable } from '../../../domain/financial-model';
import { PAID_MESSAGE } from './constants';
import { PayablesLayout } from './layout';

export function PayablesController() {
  const [isCreatingState, setIsCreatingState] = useState(false);
  const { data: payables = [] } = useQuery(payablesQuery());
  const pay = usePayPayable();
  const today = todayKey();

  return (
    <PayablesLayout
      rows={payables.map((payable) => ({
        payable,
        isOverdue: dateOnlyKey(payable.dueDate) < today,
      }))}
      isCreating={isCreatingState}
      onNewClick={() => setIsCreatingState(true)}
      onPayClick={(payable: IPayable) =>
        pay.mutate(payable.id, { onSuccess: () => toast(PAID_MESSAGE) })
      }
      onFormClose={() => setIsCreatingState(false)}
    />
  );
}
