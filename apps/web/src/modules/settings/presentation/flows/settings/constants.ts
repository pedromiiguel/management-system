import { CategoriesTab } from '@/features/financial/CategoriesTab';
import { AccessTab } from '@/features/users/AccessTab';
import { GeneralFlow } from './general';

export const TABS = [
  { id: 'general', label: 'Geral', Component: GeneralFlow },
  { id: 'access', label: 'Usuários & Perfis', Component: AccessTab },
  { id: 'categories', label: 'Categorias financeiras', Component: CategoriesTab },
] as const;

export const DEFAULT_TITLE = 'Configurações';
