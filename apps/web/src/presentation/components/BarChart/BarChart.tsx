import { BarChartView } from './BarChart.view';
import type { BarChartProps } from './BarChart.types';

export function BarChart(props: BarChartProps) {
  return <BarChartView {...props} />;
}
