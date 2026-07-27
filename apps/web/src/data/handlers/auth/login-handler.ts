import type { IHttpClient } from '@/@contracts/http';
import type { LoginInput, LoginResult } from '@/domain/models/auth';
import type { ILogin } from '@/domain/usecases/auth/login';
import { authEndpoints } from '@/infra/endpoints/auth';

export class LoginHandler implements ILogin {
  constructor(private readonly httpClient: IHttpClient) {}

  async login(input: LoginInput): Promise<LoginResult> {
    const response = await this.httpClient.request<LoginInput, LoginResult>({
      url: authEndpoints.login(),
      method: 'POST',
      body: input,
    });
    return response.body;
  }
}
