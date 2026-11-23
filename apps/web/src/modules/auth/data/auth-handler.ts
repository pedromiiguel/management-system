import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type { IAuthGateway } from '../domain/auth-gateway';
import type { ILoginResponse, ISessionUser, TLoginParams } from '../domain/session-model';

export class AuthHandler extends BaseService implements IAuthGateway {
  login(params: TLoginParams) {
    return this.send<ILoginResponse>({ url: '/auth/login', method: HttpMethod.POST, body: params });
  }

  getCurrentUser() {
    return this.send<ISessionUser>({ url: '/auth/me', method: HttpMethod.GET });
  }
}
