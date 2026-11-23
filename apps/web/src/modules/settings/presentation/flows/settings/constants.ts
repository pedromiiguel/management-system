import { CategoriesFlow } from '@modules/financial/presentation/flows/categories';
import { AccessFlow } from '@modules/users/presentation/flows/access';
import { GeneralFlow } from './general';

export const TABS = [
  { id: 'general', label: 'Geral', Component: GeneralFlow },
  { id: 'access', label: 'Usuários & Perfis', Component: AccessFlow },
  { id: 'categories', label: 'Categorias financeiras', Component: CategoriesFlow },
] as const;

export const DEFAULT_TITLE = 'Configurações';
