import type { ILoginResponse, ISessionUser, TLoginParams } from './session-model';

export interface IAuthGateway {
  login: (params: TLoginParams) => Promise<ILoginResponse>;
  /** Usuário logado como a API o resolve agora (permissões vivas). */
  getCurrentUser: () => Promise<ISessionUser>;
}
