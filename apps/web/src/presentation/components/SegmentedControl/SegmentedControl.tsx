import { SegmentedControlView } from './SegmentedControl.view';
import type { SegmentedControlProps } from './SegmentedControl.types';

export function SegmentedControl<T extends string>(props: SegmentedControlProps<T>) {
  return <SegmentedControlView {...props} />;
}
