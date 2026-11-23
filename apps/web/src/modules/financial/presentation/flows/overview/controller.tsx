import { useQuery } from '@tanstack/react-query';
import { dashboardQuery } from '@modules/financial/main/financial-queries';
import { OverviewLayout } from './layout';
import { grossMargin, methodShares, targetProgress } from './utils';

export function OverviewController() {
  const { data: dashboard } = useQuery(dashboardQuery());

  return (
    <OverviewLayout
      dashboard={dashboard}
      grossMargin={grossMargin(dashboard?.result)}
      methodShares={methodShares(dashboard?.byMethodMonth ?? [])}
      target={targetProgress(dashboard)}
    />
  );
}
