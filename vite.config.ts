import { defineConfig } from 'vite-plus';

// Configuração do Vite+ para o monorepo inteiro: formatação (Oxfmt) e lint
// (Oxlint). O Vite/Vitest de cada pacote fica no vite.config.ts do próprio
// pacote (apps/web, packages/shared).
const LAYER_MESSAGE =
  'Import fora da regra de dependência das camadas (docs/arquitetura.md#camadas).';
/** Camadas de fora: domain e data nunca as importam. */
const OUTER_LAYERS = [
  '@infra/**',
  '@main/**',
  '@presentation/**',
  '@modules/*/main/**',
  '@modules/*/presentation/**',
  '@/**',
];

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
      // Clean Architecture (docs/arquitetura.md#camadas): cada camada só importa
      // o que muda menos que ela. `main/` monta tudo e não tem restrição.
      {
        files: ['apps/web/src/@shared/**/*.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@/**', '@*/**', '!@beverage/**', 'react', 'axios'],
                  message: LAYER_MESSAGE,
                },
              ],
            },
          ],
        },
      },
      {
        files: ['apps/web/src/domain/**/*.ts', 'apps/web/src/modules/*/domain/**/*.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: [
                    ...OUTER_LAYERS,
                    '@data/**',
                    '@modules/*/data/**',
                    'react',
                    'axios',
                    '@tanstack/**',
                  ],
                  message: LAYER_MESSAGE,
                },
              ],
            },
          ],
        },
      },
      {
        files: ['apps/web/src/data/**/*.ts', 'apps/web/src/modules/*/data/**/*.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: [...OUTER_LAYERS, 'react', 'axios', '@tanstack/**'],
                  message: LAYER_MESSAGE,
                },
              ],
            },
          ],
        },
      },
      {
        files: ['apps/web/src/infra/**/*.ts'],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: ['@data/**', '@main/**', '@presentation/**', '@modules/**', '@/**'],
                  message: LAYER_MESSAGE,
                },
              ],
            },
          ],
        },
      },
      {
        // Entre módulos, a apresentação usa o main/ do outro (queries, mutations,
        // sessão), tipos do domain/ e a entrada de um flow — nunca data/ ou infra/.
        files: [
          'apps/web/src/presentation/**/*.{ts,tsx}',
          'apps/web/src/modules/*/presentation/**/*.{ts,tsx}',
        ],
        rules: {
          'no-restricted-imports': [
            'error',
            {
              patterns: [
                {
                  group: [
                    '@data/**',
                    '@infra/**',
                    '@modules/*/data/**',
                    '@modules/*/presentation/**',
                    '!@modules/*/presentation/flows/*',
                    '@/lib/**',
                    'axios',
                  ],
                  message: LAYER_MESSAGE,
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
