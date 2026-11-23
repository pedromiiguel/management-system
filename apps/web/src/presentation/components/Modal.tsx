import { useId, type ReactNode } from 'react';

export function Modal({
  title,
  onClose,
  children,
  width,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}) {
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
        <div className="s-modal-title" id={titleId}>
          {title}
        </div>
        {children}
      </div>
    </div>
  );
}

/** Rodapé padrão dos modais: ações alinhadas à direita. */
export function ModalActions({ children }: { children: ReactNode }) {
  return <div className="flex gap-2 justify-end mt-3.5">{children}</div>;
}
