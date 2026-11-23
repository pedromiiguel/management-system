import { HOME_PATH } from '@presentation/constants/navigation';

/** Destino pós-login: só caminho interno (um único "/"), evitando open redirect. */
export function safeRedirectTarget(target: string | undefined): string {
  if (target && target.startsWith('/') && !target.startsWith('//')) return target;
  return HOME_PATH;
}
