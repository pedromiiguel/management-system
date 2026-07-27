import { ToggleView } from './Toggle.view';
import type { ToggleProps } from './Toggle.types';

export function Toggle(props: ToggleProps) {
  return <ToggleView {...props} />;
}
