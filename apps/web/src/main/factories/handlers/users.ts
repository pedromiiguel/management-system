import { CreateRoleHandler } from '@/data/handlers/users/create-role-handler';
import { CreateUserHandler } from '@/data/handlers/users/create-user-handler';
import { SearchRoleHandler } from '@/data/handlers/users/search-role-handler';
import { SearchUserHandler } from '@/data/handlers/users/search-user-handler';
import { UpdateRoleHandler } from '@/data/handlers/users/update-role-handler';
import { UpdateUserHandler } from '@/data/handlers/users/update-user-handler';
import { httpClient } from '@/main/factories/http/make-http-client';

export const makeSearchUser = () => new SearchUserHandler(httpClient);
export const makeCreateUser = () => new CreateUserHandler(httpClient);
export const makeUpdateUser = () => new UpdateUserHandler(httpClient);
export const makeSearchRole = () => new SearchRoleHandler(httpClient);
export const makeCreateRole = () => new CreateRoleHandler(httpClient);
export const makeUpdateRole = () => new UpdateRoleHandler(httpClient);
