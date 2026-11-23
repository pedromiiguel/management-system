# Arquitetura

Visão curta da estrutura atual. Vocabulário do domínio: [CONTEXT.md](../CONTEXT.md).
Por que é assim: [ADR 0014](adr/0014-organizacao-por-funcionalidade.md) e, no web,
[ADR 0016](adr/0016-clean-architecture-por-modulo.md). Regra geral:
**as peças que mudam juntas moram juntas; cada fato tem uma fonte só.**

```
packages/shared   contrato: schemas Zod, enums + rótulos, permissões, priceSale, dia da loja
apps/api          NestJS + Prisma: um módulo por domínio, ledgers donos das tabelas
apps/web          React: Clean Architecture com as camadas dentro de cada módulo
apps/e2e          Playwright contra web + api
```

## Contrato (`packages/shared`)

- `schemas.ts` — validação de corpo e de query string, usada pelo `ZodValidationPipe`
  da API e pelo `zodResolver` dos formulários. Schemas base sem `.default()`;
  criação aplica defaults; atualização é `base.partial()`. As configurações
  têm chaves e tipos num schema só (`SETTING_KEYS`, `parseSetting` para cada
  valor lido, `updateSettingsSchema` para o PUT) e defaults em `DEFAULT_SETTINGS`.
- `enums.ts` — vocabulário (status da venda, formas de pagamento…) com rótulos
  pt-BR; espelha o `schema.prisma` (um teste da API falha se divergirem).
- `permissions.ts` — catálogo de permissões e rótulos.
- `sale.ts` — `priceSale` (subtotal, desconto, Taxa de serviço, total, troco, em
  centavos inteiros), `saleCode`, `SERVICE_FEE_LABEL`.
- `time.ts` — a regra única de "um dia": dia civil da loja (America/Sao_Paulo)
  para períodos, agrupamentos e "hoje"; datas sem hora (vencimento, validade)
  como `AAAA-MM-DD` sem conversão de fuso (`dateOnlyKey`, `addDaysToKey`,
  `daysBetweenKeys`, `storeMonthKeys`).

## API (`apps/api/src`)

- `modules/<domínio>/` — `controller` (rota, `@RequirePermission`, validação) →
  `service` (regra de negócio, Prisma). Serviços se compõem por injeção.
- Donos de agregado, chamados dentro da transação de quem os usa:
  - `stock/stock-ledger.ts` — único escritor de saldo, movimentos e lotes
    (Entrada, Ajustar, baixa da venda em FEFO, devolução do estorno).
  - `cash-register/cash-ledger.ts` — único escritor de movimentos de caixa e dono
    do "caixa aberto".
  - `receivables` — fiado (`createForSale` / `cancelForSale`).
- `sales/sales-query.ts` — só leitura, fora de transação: a única definição de
  "venda concluída no período", de Receita e da Taxa de serviço à parte, usada
  pelo painel e pelos relatórios.
- `modules/auth` — tudo de autenticação/autorização junto: guards globais
  (`jwt-auth.guard`, `permissions.guard`), decorators (`@Public`,
  `@RequirePermission`, `@CurrentUser`/`AuthUser`) e `SessionService` (usuário e
  permissões resolvidos por requisição).
- `common/` — só o que não é de nenhum domínio: `ZodValidationPipe`, filtro de
  erros do Prisma, CSV.
- `config/` — `env.ts` (ambiente validado na subida) e `configureApp` (prefixo
  `/api`, CORS, filtro de erros do Prisma, Decimal → número), usado também
  pelos testes e2e.

## Web (`apps/web/src`)

Clean Architecture do guia, com as camadas agrupadas por módulo
([ADR 0016](adr/0016-clean-architecture-por-modulo.md)).

- `routes/` — rotas de arquivo do TanStack Router, finas; `_app.tsx` exige sessão.
  Importam só a entrada de um flow (`@modules/<m>/presentation/flows/<tela>`).
- `modules/<m>/` — um módulo por funcionalidade:
  - `domain/` — models (formato da API e da tela) e `I<M>Gateway`, a interface com
    um método por chamada à API. Tipos puros e regras sem framework.
  - `data/` — `<M>Handler extends BaseService implements I<M>Gateway`: só conhece o
    `IHttpClient`. Converter só quando há transformação real.
  - `main/` — `make<M>Gateway()` e as `queryOptions`/mutations (TanStack Query), que
    invalidam tudo o que o efeito no servidor atinge. É o que a apresentação importa.
  - `presentation/flows/<tela>/` — `index.ts` (exporta o controller como `<Tela>Flow`),
    `controller.tsx` (estado, hooks, queries), `layout.tsx` (JSX, só props),
    `types.ts`, `constants.ts` e, quando preciso, `schema.ts`, `utils.ts`,
    `components/` e sub-flows.
  - Módulos: `auth` (sessão e login), `settings`. Ainda em `features/` (ADR 0014),
    migrando um por PR: `sale`, `products`, `stock`, `financial`, `reports`, `users`.
- `@shared/` — contratos técnicos sem framework (`IHttpClient`, `IKeyValueStorage`).
- `domain/` — erros de domínio (`NotFoundError`, `ConflictError`…, com `status`) e
  `IPaginated`.
- `data/base-service/` — `BaseService.send`: 2xx devolve o corpo; o resto vira erro de
  domínio com a mensagem da API.
- `infra/` — `AxiosHttpClient` (nunca lança; token e 401 por construtor),
  `BrowserLocalStorage`.
- `main/` — composition root: `makeHttpClient`, `query/query-client` (toast global de
  erro, ignora 401), `query/query-keys` (`rootKeys` + `useInvalidate`).
- `presentation/` — `components/` (UI compartilhada, pasta plana), `flows/app-shell`,
  `utils/` (`toast`, `format`), `hooks/`, `constants/navigation`.
- `lib/http.ts` — ponte temporária sobre o `BaseService` para o que ainda está em
  `features/`; some no fim da migração.

### Camadas

```
presentation ──► main ──► data ──► domain
                  │         │        ▲
                  └──► infra ┘        │
        todas podem importar ──► @shared
```

- `@shared/` não importa nenhuma camada nem framework.
- `domain/` (global e de módulo) não importa data, infra, main, presentation, React,
  axios nem TanStack.
- `data/` só importa domain e `@shared`; nada de axios, React ou TanStack.
- `infra/` não importa data, main, presentation nem módulos.
- `presentation/` não importa `data/` nem `infra/`. De outro módulo, só o `main/`, tipos
  do `domain/` e a entrada de um flow.
- `main/` monta tudo e pode importar qualquer camada.

O Oxlint (`no-restricted-imports` no `vite.config.ts` da raiz) barra o resto.

### Dependências (`features/`, enquanto existir)

- Entre funcionalidades, só o `api.ts` e os **componentes de entrada**:
  `financial/CategoriesTab` e `users/AccessTab` (Configurações),
  `stock/StockEntryModal` (Produtos) e `sale/SaleDetailModal` (Relatórios).

Uma funcionalidade nova costuma ser: schema no shared → módulo na API com permissão →
`modules/<m>/` (gateway, handler, factory, queries, flow) → rota.

## Testes

- `packages/shared` e `apps/web`: Vitest (`vp test`) da lógica pura (precificação, dia da
  loja, cupom, fila do PDV) e dos handlers que transformam dados, com o `IHttpClient`
  mockado à mão.
- `apps/api/test`: e2e com supertest num Postgres real — cobrem as regras de
  negócio e suas ramificações (BR-xx, permissões, erros). Um `migrate reset`
  por execução; cada bloco volta a "seed base + fixtures" com `t.reset()`.
- `apps/e2e`: Playwright contra web + api — verifica a integração UI ↔ API no
  caminho feliz, pelos nomes acessíveis em pt-BR. O banco é resetado uma vez
  por arquivo (`npm run db:reset` da raiz, que compila o shared antes do seed),
  então testes de um mesmo arquivo compartilham estado e cada arquivo parte do
  zero. Dados esperados vêm do seed da API (`support/seed-data.ts`) e os
  formatos de dinheiro do próprio web (`support/format.ts`).
- As duas suítes apagam o banco do `DATABASE_URL`.
  `apps/api/test/support/local-database.ts` recusa `NODE_ENV=production` e
  hosts que não sejam esta máquina (`localhost`/`127.0.0.1`/`::1`) e dá o
  consentimento do Prisma. Não reconhece qual banco local é qual: nunca rode
  os testes contra o banco da loja.
