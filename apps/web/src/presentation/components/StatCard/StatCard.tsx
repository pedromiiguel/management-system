import { StatCardView } from './StatCard.view';
import type { StatCardProps } from './StatCard.types';

export function StatCard(props: StatCardProps) {
  return <StatCardView {...props} />;
}
