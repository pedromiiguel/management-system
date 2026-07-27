export const usersEndpoints = {
  users: () => '/users',
  user: (id: string) => `/users/${id}`,
  roles: () => '/users/roles',
  rolesAll: () => '/users/roles/all',
  role: (id: string) => `/users/roles/${id}`,
};
