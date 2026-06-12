/**
 * Catálogo de permissões por funcionalidade (NFR-05, Seção 3 da spec).
 * Roles são conjuntos configuráveis dessas permissões — novos papéis
 * (Caixa, Estoquista, Financeiro) entram sem alteração de código.
 */
export const Permission = {
  PRODUCTS_READ: 'products.read',
  PRODUCTS_WRITE: 'products.write',
  STOCK_READ: 'stock.read',
  STOCK_WRITE: 'stock.write',
  SALES_OPERATE: 'sales.operate',
  SALES_VOID: 'sales.void',
  SALES_HISTORY: 'sales.history',
  CUSTOMERS_READ: 'customers.read',
  CUSTOMERS_WRITE: 'customers.write',
  CASH_OPERATE: 'cash.operate',
  FINANCIAL_READ: 'financial.read',
  FINANCIAL_WRITE: 'financial.write',
  REPORTS_READ: 'reports.read',
  SETTINGS_WRITE: 'settings.write',
  USERS_MANAGE: 'users.manage',
} as const;
export type Permission = (typeof Permission)[keyof typeof Permission];

export const ALL_PERMISSIONS: Permission[] = Object.values(Permission);

export const PERMISSION_LABELS: Record<Permission, string> = {
  'products.read': 'Consultar produtos',
  'products.write': 'Cadastrar/editar produtos',
  'stock.read': 'Consultar estoque',
  'stock.write': 'Movimentar estoque',
  'sales.operate': 'Operar o PDV',
  'sales.void': 'Cancelar venda concluída',
  'sales.history': 'Ver histórico de vendas',
  'customers.read': 'Consultar clientes',
  'customers.write': 'Cadastrar/editar clientes',
  'cash.operate': 'Abrir/fechar caixa, sangria e suprimento',
  'financial.read': 'Ver financeiro e dashboard',
  'financial.write': 'Lançamentos financeiros e baixas',
  'reports.read': 'Ver relatórios',
  'settings.write': 'Alterar configurações',
  'users.manage': 'Gerenciar usuários e papéis',
};
