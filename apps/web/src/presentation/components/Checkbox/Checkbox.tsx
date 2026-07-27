import { CheckboxView } from './Checkbox.view';
import type { CheckboxProps } from './Checkbox.types';

export function Checkbox(props: CheckboxProps) {
  return <CheckboxView {...props} />;
}
