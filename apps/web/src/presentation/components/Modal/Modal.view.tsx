import { useId } from 'react';
import type { ModalProps } from './Modal.types';

export function ModalView({ title, onClose, children, width }: ModalProps) {
  const titleId = useId();
  return (
    <div className="s-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="s-modal"
        style={width ? { width } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="s-modal-title" id={titleId}>{title}</div>
        {children}
      </div>
    </div>
  );
}
