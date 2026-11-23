# Entrega: commit, PR, CI e deploy

## Antes de abrir o PR

Rode só o que a mudança toca (o CI faz o mesmo, por pasta):

- `npm run check` — `vp check`: Oxfmt (formatação) + Oxlint (lint) no repo todo. O CI
  roda em todo PR, até em mudança só de docs. Para corrigir: `npm run format` (`vp fmt`).
  Config de ambos no `vite.config.ts` da raiz.
- `npm run typecheck` — shared + api + web (a web precisa do `routeTree.gen.ts`: rode o
  build ou o dev dela antes).
- `npm test` e, se mexeu em regra de negócio da API, `npm run test:e2e:api` (leia antes
  [testes.md](testes.md)).
- `npm run build` compila na ordem shared → api → web (a ordem importa).

## Dependências e ferramental (Vite+)

- O `overrides` do `package.json` da raiz aponta `vite` para `@voidzero-dev/vite-plus-core`:
  mantenha na mesma versão que o `vite-plus` traz ao atualizar.
- Regras de lint por pasta ficam em `lint.overrides` no `vite.config.ts` da raiz; o plugin
  do React Compiler roda como plugin JS do Oxlint. A config de Vite/Vitest fica em cada
  pacote (`apps/web/vite.config.ts`).
- Lint com tipos está desligado até os tsconfigs largarem `baseUrl` /
  `moduleResolution: node`.

## CI/CD

`.github/workflows/ci-cd.yml` roda só os jobs cuja pasta mudou (só docs → só `check`):
check (`vp check`, sempre), shared, api (build/type-check/unitários), api-e2e, web
(build/type-check/testes) e
lighthouse (todas as telas, logado por uma API semeada; `apps/web/lighthouserc.json`).
`CI ok` é o único check obrigatório. Na `main`, publica a API no Railway e/ou a web na
Vercel. Tabela completa, secrets e variáveis: [docs/deploy.md](../deploy.md).

## Produção local (docker)

`docker compose up -d postgres` sobe o Postgres 17 (`localhost:5432`, usuário/senha/banco
`beverage`); o serviço `backup` faz `pg_dump` diário em `backups/`. O perfil `prod`
(`docker compose --profile prod up -d --build`) constrói e roda api + web
(`docker/web.Dockerfile`, nginx fazendo proxy de `/api`) e exige `JWT_SECRET`.

## Decisões

Mudança de estrutura ou de convenção ganha um ADR em [docs/adr/](../adr/) e, se mudar
a estrutura, atualiza [docs/arquitetura.md](../arquitetura.md).
