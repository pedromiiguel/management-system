import type { ScreenProps } from './Screen.types';

/** Topbar + conteúdo, padrão de todas as telas autenticadas (chrome do design). */
export function ScreenView({ title, topRight, children }: ScreenProps) {
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
