import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { monthToDate } from '@presentation/utils/format';
import { cashFlowQuery } from '@modules/financial/main/financial-queries';
import { EntriesLayout } from './layout';

export function EntriesController() {
  const [periodState, setPeriodState] = useState(monthToDate);
  const [isCreatingState, setIsCreatingState] = useState(false);
  const { data: cashFlow } = useQuery(cashFlowQuery(periodState));

  return (
    <EntriesLayout
      period={periodState}
      cashFlow={cashFlow}
      isCreating={isCreatingState}
      onPeriodChange={setPeriodState}
      onNewClick={() => setIsCreatingState(true)}
      onFormClose={() => setIsCreatingState(false)}
    />
  );
}
