import { ModalView } from './Modal.view';
import type { ModalProps } from './Modal.types';

export function Modal(props: ModalProps) {
  return <ModalView {...props} />;
}
