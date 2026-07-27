import { ProgressBarView } from './ProgressBar.view';
import type { ProgressBarProps } from './ProgressBar.types';

export function ProgressBar(props: ProgressBarProps) {
  return <ProgressBarView {...props} />;
}
