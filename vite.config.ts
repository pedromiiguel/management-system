import { defineConfig } from 'vite-plus';

// Configuração do Vite+ para o monorepo inteiro: formatação (Oxfmt) e lint
// (Oxlint). O Vite/Vitest de cada pacote fica no vite.config.ts do próprio
// pacote (apps/web, packages/shared).
export default defineConfig({
  lint: {
    ignorePatterns: ['**/dist/**', 'apps/web/src/routeTree.gen.ts'],
    jsPlugins: [
      { name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' },
      // Plugin ESLint do React Compiler, rodando pelo suporte a plugins JS do Oxlint.
      { name: 'react-compiler', specifier: 'eslint-plugin-react-compiler' },
    ],
    rules: { 'vite-plus/prefer-vite-plus-imports': 'error' },
    // Sem lint com tipos por enquanto: o tsrs (TypeScript 7) não aceita
    // `baseUrl` nem `moduleResolution: node` dos tsconfigs da API e do e2e.
    // O type-check continua com o tsc (`npm run typecheck`).
    options: { typeAware: false, typeCheck: false },
    overrides: [
      {
        files: ['apps/web/src/**/*.{ts,tsx}'],
        rules: { 'react-compiler/react-compiler': 'error' },
      },
      {
        // Entre funcionalidades, só o api.ts e os componentes de entrada (páginas
        // ficam para as rotas). Ver "Dependências" em docs/arquitetura.md.
        files: ['apps/web/src/features/**/*.{ts,tsx}'],
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
      {
        // lib e components dependem só do que muda menos que eles.
        files: ['apps/web/src/components/**/*.{ts,tsx}'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                { group: ['@/features/**'], message: 'components/ não importa features/.' },
              ],
            },
          ],
        },
      },
      {
        files: ['apps/web/src/lib/**/*.{ts,tsx}'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@/features/**', '@/components/**'],
                  message: 'lib/ não importa components/ nem features/.',
                },
              ],
            },
          ],
        },
      },
    ],
  },
  fmt: {
    singleQuote: true,
    trailingComma: 'all',
    printWidth: 100,
    semi: true,
    sortPackageJson: false,
    ignorePatterns: [],
  },
});
