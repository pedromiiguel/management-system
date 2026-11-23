import { formatBRL } from '@presentation/utils/format';
import type { ToastTone } from '@presentation/utils/toast';

/** Aviso do fechamento: diferença zero, sobra ou falta (BR-06). */
export function closeRegisterMessage(difference: number | null): {
  message: string;
  tone: ToastTone;
} {
  if (!difference) return { message: 'Caixa fechado — diferença zero ✓', tone: 'info' };
  const kind = difference > 0 ? 'sobra' : 'falta';
  return {
    message: `Caixa fechado — ${kind} de ${formatBRL(Math.abs(difference))}`,
    tone: 'warn',
  };
}

/** Tom da diferença no histórico: zero ok, sobra destacada, falta em vermelho. */
export function differenceTone(difference: number | null): 'ok' | 'accent' | 'danger' {
  if (!difference) return 'ok';
  return difference > 0 ? 'accent' : 'danger';
}
