import { ButtonView } from './Button.view';
import type { ButtonProps } from './Button.types';

export function Button(props: ButtonProps) {
  return <ButtonView {...props} />;
}
