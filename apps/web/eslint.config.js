import reactCompiler from 'eslint-plugin-react-compiler';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: ['dist/**', 'src/routeTree.gen.ts'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-compiler': reactCompiler,
    },
    rules: {
      'react-compiler/react-compiler': 'error',
    },
  },
  {
    // Entre funcionalidades, só o api.ts e os componentes de entrada (páginas
    // ficam para as rotas). Ver "Dependências" em docs/arquitetura.md.
    files: ['src/features/**/*.{ts,tsx}', 'src/components/**/*.{ts,tsx}', 'src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/features/*/*',
                '!@/features/*/api',
                '!@/features/financial/CategoriesTab',
                '!@/features/users/AccessTab',
                '!@/features/stock/StockEntryModal',
                '!@/features/sale/SaleDetailModal',
              ],
              message:
                'Entre funcionalidades importe só o api.ts ou um componente de entrada (docs/arquitetura.md).',
            },
          ],
        },
      ],
    },
  },
];
