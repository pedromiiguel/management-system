# 0015 — Ferramentas do monorepo com Vite+

- **Status:** Aceito (implementado)
- **Data:** 2026-11-23

## Contexto

O repositório usava ferramentas separadas, cada uma com sua config e versão:
Vite 8 e Vitest 4 no `apps/web`, Vitest 4 no `packages/shared`, ESLint 10 com
`typescript-eslint` só no `apps/web` (`eslint.config.js`) e Prettier 3 na raiz
(`.prettierrc`). O CI baixava o Prettier à parte e rodava o lint só quando o
web mudava.

O [Vite+](https://viteplus.dev/guide/) junta Vite, Vitest, Oxlint (lint),
Oxfmt (formatação compatível com o Prettier), tsdown e Vite Task num pacote
só (`vite-plus`, CLI `vp`).

## Decisão

Migrar com `vp migrate` (Vite+ 1.7.0) e ajustar à mão o que ele não cobre:

- `vite-plus` como devDependency da raiz, do web e do shared; `vite` vira um
  alias para `@voidzero-dev/vite-plus-core` (campo `overrides` da raiz, exigido
  com npm). Scripts do web e do shared usam `vp dev`, `vp build`, `vp preview`
  e `vp test run`; testes importam de `vite-plus/test`.
- `apps/web/vitest.config.ts` entra no `apps/web/vite.config.ts` (bloco
  `test`), que passa a ser a única config do Vite/Vitest do web. Os plugins
  ficam em `lazyPlugins` para `vp check`/`lint`/`fmt` não carregá-los.
- Lint e formatação num `vite.config.ts` na raiz, valendo para o repositório
  inteiro:
  - `fmt`: as mesmas opções do `.prettierrc` (removido). O Oxfmt reformatou
    oito arquivos (um `.tsx` e trechos de ADRs).
  - `lint`: o ESLint do web (removido) foi portado para o Oxlint — o
    `no-restricted-imports` entre funcionalidades e de `lib/`/`components/`
    vira `lint.overrides` por pasta, e o `eslint-plugin-react-compiler` roda
    como plugin JS do Oxlint. Os padrões `@/features/*` viraram
    `@/features/**`, porque no Oxlint `*` não cobre subcaminhos.
- Novo `npm run check` (`vp check`: formatação + lint). No CI o job `format`
  (Prettier) vira `check`, que roda sempre e cobre o lint de todo o repo; o
  job `web` deixa de rodar o lint.

Fica de fora, por ora:

- **API (Nest):** continua com Jest (unitários e e2e) e `nest build`. Os
  testes dependem de `emitDecoratorMetadata` e do harness do Jest; migrar
  para o Vitest é um passo separado.
- **Type-check:** continua no `tsc` (`npm run typecheck`). O lint com tipos
  do Vite+ (`typeAware`/`typeCheck`, via tsrs/TypeScript 7) recusa `baseUrl`
  e `moduleResolution: node` dos tsconfigs da API e do e2e; ligar exige
  ajustar esses tsconfigs (e o `rootDir` da API) antes.
- **CI:** continua com `actions/setup-node` + `npm ci`, que já instalam o
  `vite-plus` do lockfile; a action `voidzero-dev/setup-vp` não é necessária.

## Consequências

- Uma dependência (`vite-plus`) define as versões de Vite, Vitest, Oxlint e
  Oxfmt; atualizar é trocar a versão dela e o alias do `overrides` juntos.
- `vp check` roda formatação e lint do repositório em ~3 s.
- Regras de lint novas entram no `vite.config.ts` da raiz, não em configs
  por pacote (o Vite+ ignora blocos `lint`/`fmt` aninhados).
- O Oxlint roda também a categoria `correctness` padrão em todo o repo; hoje
  ela dá 2 avisos (não falham o CI).
