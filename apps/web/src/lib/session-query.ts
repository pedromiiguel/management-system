import { queryOptions } from '@tanstack/react-query';
import { http } from './http';
import { rootKeys } from './query-keys';
import { refreshSessionUser, type SessionUser } from './session';

/**
 * Usuário logado como a API o resolve agora (`/auth/me`: permissões vivas e
 * nome do papel). Cada resposta atualiza a sessão guardada — o login só dá a
 * versão daquele momento. Carregada na entrada do app (`_app` beforeLoad),
 * observada pelo AppShell e invalidada quando papéis mudam.
 */
export const sessionQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.session],
    queryFn: async () => {
      const user = await http.get<SessionUser>('/auth/me');
      refreshSessionUser(user);
      return user;
    },
  });
