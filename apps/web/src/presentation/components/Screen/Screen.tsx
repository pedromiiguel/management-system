import { ScreenView } from './Screen.view';
import type { ScreenProps } from './Screen.types';

export function Screen(props: ScreenProps) {
  return <ScreenView {...props} />;
}
