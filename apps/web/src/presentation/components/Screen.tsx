import type { ReactNode } from 'react';

/** Topbar + conteúdo, padrão de todas as telas autenticadas (chrome do design). */
export function Screen({
  title,
  topRight,
  children,
}: {
  title: string;
  topRight?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <div className="s-topbar">
        <span className="s-title">{title}</span>
        <span className="s-topbar-right">{topRight}</span>
      </div>
      <div className="s-content">{children}</div>
    </>
  );
}
