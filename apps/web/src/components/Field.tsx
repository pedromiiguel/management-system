import type { ReactNode } from 'react';

/** Rótulo + caixa de input + mensagem de erro. */
export function Field({
  label,
  error,
  className,
  children,
}: {
  label: ReactNode;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <div className="s-label">{label}</div>
      <div className="s-input">{children}</div>
      {error ? <div className="s-error">{error}</div> : null}
    </div>
  );
}
