export const DELETED_MESSAGE = 'Produto excluído';

export const deleteConfirmation = (productName: string) => ({
  title: 'Excluir produto?',
  message: `Tem certeza que deseja excluir ${productName}? Essa ação não pode ser desfeita.`,
  confirmLabel: 'Excluir',
  danger: true,
});

export const TABLE_COLUMNS = [
  'SKU',
  'Código de barras',
  'Produto',
  'Preço venda',
  'Estoque',
  'Mín.',
  'Situação',
  'Ações',
];
export const TABLE_WIDTHS = '80px 140px 1fr 110px 80px 60px 150px 60px';
export const TABLE_ALIGN = [null, null, null, 'right', 'center', 'center', null, 'center'] as const;
