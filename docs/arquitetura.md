# Arquitetura

Visão curta da estrutura atual. Vocabulário do domínio: [CONTEXT.md](../CONTEXT.md).
Por que é assim: [ADR 0014](adr/0014-organizacao-por-funcionalidade.md). Regra geral:
**as peças que mudam juntas moram juntas; cada fato tem uma fonte só.**

```
packages/shared   contrato: schemas Zod, enums + rótulos, permissões, priceSale, dia da loja
apps/api          NestJS + Prisma: um módulo por domínio, ledgers donos das tabelas
apps/web          React: uma pasta por funcionalidade
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

- `routes/` — rotas de arquivo do TanStack Router, finas; `_app.tsx` exige sessão.
- `features/<f>/` — `api.ts` (chamadas tipadas, `queryOptions`, mutations que
  invalidam o que o servidor alterou), páginas/componentes `.tsx` e lógica pura
  com teste ao lado. Funcionalidades: `auth`, `sale` (PDV), `products`, `stock`,
  `financial`, `reports`, `settings`, `users`.
- `lib/` — `http` (erros viram `ApiError`), `session` e `session-query`
  (permissões vivas de `/auth/me`), `query-keys`, `query-client` (aviso de erro
  de consultas e ações), `toast`, `format` (dinheiro e datas pela regra do
  `time.ts`).
- `components/` — componentes de UI compartilhados, numa pasta plana.

### Dependências

Tudo depende do que muda menos: `routes → features → components → lib → shared`.

- `lib/` não importa `components/` nem `features/`; `components/` não importa
  `features/`.
- Entre funcionalidades, só o `api.ts` (tipos, `queryOptions`, mutations) e os
  **componentes de entrada** — feitos para serem embutidos por outra tela:
  `financial/CategoriesTab` e `users/AccessTab` (Configurações),
  `stock/StockEntryModal` (Produtos) e `sale/SaleDetailModal` (Relatórios).
  Páginas são importadas só pelas rotas. O resto (lógica pura, componentes
  internos) fica dentro da funcionalidade; se outra precisar, vira um
  componente de entrada ou sobe para `components/`/`lib/`/shared.
- O ESLint (`apps/web/eslint.config.js`, `no-restricted-imports`) barra o resto;
  um componente de entrada novo entra na lista de lá e daqui.

Uma funcionalidade nova costuma ser: schema no shared → módulo na API com
permissão → `features/<f>/api.ts` + página → rota.

## Testes

- `packages/shared` e `apps/web`: vitest da lógica pura (precificação, dia da
  loja, cupom, fila do PDV).
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
