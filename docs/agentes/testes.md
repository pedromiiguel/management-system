# Testes

O que cada suíte cobre e como o banco é resetado: [arquitetura.md › Testes](../arquitetura.md#testes).

> **Nunca rode as suítes e2e contra o banco da loja.** `test:e2e:api` e `test:e2e`
> apagam o banco do `DATABASE_URL`, e a trava (`apps/api/test/support/`) só recusa
> `NODE_ENV=production` e hosts fora desta máquina: ela não distingue o banco de dev do
> banco da loja na mesma máquina. Antes de rodar, siga a skill `rodar-e2e`.

## Comandos (da raiz)

| Comando                | O que roda                                                                              |
| ---------------------- | --------------------------------------------------------------------------------------- |
| `npm test`             | jest unitário da API + `vp test` (Vitest) do shared e da web (sem build do shared)      |
| `npm run test:e2e:api` | e2e da API (jest `--runInBand`, Postgres real)                                          |
| `npm run test:e2e`     | Playwright (`apps/e2e`); sobe ou reaproveita `dev:api` + `dev:web` nas portas 3000/5173 |

Um teste só:

- `npm test --workspace apps/api -- shared-enums` (trecho do nome do arquivo ou `-t "nome"`)
- `npm test --workspace apps/web -- receipt`
- `npm test --workspace packages/shared`

## Onde ficam

- API unitário: `*.spec.ts` ao lado do código em `apps/api/src/`.
- API e2e: `apps/api/test/*.e2e-spec.ts`, harness em `test/support/` (um
  `migrate reset` por execução; `createTestApp()` usa o `configureApp` de produção).
- Web e shared: Vitest (via `vp test`, importando de `vite-plus/test`) ao lado da lógica
  pura (ex.: `features/sale/receipt.ts`) e dos handlers/stores da web que têm regra própria
  (ex.: `modules/auth/data/session-store.ts`), com o `IHttpClient`/`IKeyValueStorage`
  mockado à mão. Handler que só repassa o HTTP não ganha teste: o e2e cobre.
- Jest e vitest mapeiam `@beverage/shared` para o código-fonte TypeScript, então não
  precisam do build do shared.

## Pegadinhas

- `test/schema.e2e-spec.ts` falha se faltar um dos índices parciais que só existem em
  SQL (ver skill `nova-migration-prisma`).
- `src/common/shared-enums.spec.ts` falha se os enums do shared divergirem do
  `schema.prisma`.
