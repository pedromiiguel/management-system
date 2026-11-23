import type { TProductFormInput } from './schema';

export const WIDTH = 520;
export const NEW_PRODUCT_TITLE = 'Novo produto';
export const NEW_PRODUCT_DEFAULTS: Partial<TProductFormInput> = {
  unit: 'un',
  minimumStock: 0,
  active: true,
};

export const SAVED_MESSAGE_BY_MODE = {
  edit: 'Produto atualizado',
  new: 'Produto cadastrado',
} as const;
export const DEACTIVATED_MESSAGE = 'Produto desativado';
export const SUBMIT_LABEL_BY_SAVING = { true: 'Salvando…', false: 'Salvar' } as const;
export const DEACTIVATE_LABEL_BY_ACTIVE = { true: 'Desativar', false: 'Produto inativo' } as const;
