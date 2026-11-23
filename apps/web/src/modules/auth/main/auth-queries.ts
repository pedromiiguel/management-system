import { queryOptions, useMutation } from '@tanstack/react-query';
import { rootKeys } from '@main/query/query-keys';
import type { TLoginParams } from '../domain/session-model';
import { makeAuthGateway } from './auth-factory';
import { refreshSessionUser, startSession } from './session';

/**
 * Usuário logado como a API o resolve agora. Cada resposta atualiza a sessão
 * guardada — o login só dá a versão daquele momento. Carregada na entrada do
 * app (`_app` beforeLoad), observada pelo AppShell e invalidada quando papéis mudam.
 */
export const sessionQuery = () =>
  queryOptions({
    queryKey: [...rootKeys.session],
    queryFn: async () => {
      const user = await makeAuthGateway().getCurrentUser();
      refreshSessionUser(user);
      return user;
    },
  });

/** Login: guarda a sessão; o erro fica na tela (sem toast). */
export function useLogin() {
  return useMutation({
    mutationFn: async (params: TLoginParams) => {
      const { accessToken, user } = await makeAuthGateway().login(params);
      startSession(accessToken, user);
    },
    meta: { toastError: false },
  });
}
