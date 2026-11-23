import type { ICashFlow, IPeriod } from '../../../domain/financial-model';

export type TEntriesLayoutProps = {
  period: IPeriod;
  cashFlow: ICashFlow | undefined;
  isCreating: boolean;
  onPeriodChange: (period: IPeriod) => void;
  onNewClick: () => void;
  onFormClose: () => void;
};
