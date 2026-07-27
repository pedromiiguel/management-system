import { LoginHandler } from '@/data/handlers/auth/login-handler';
import { httpClient } from '@/main/factories/http/make-http-client';

export const makeLogin = () => new LoginHandler(httpClient);
