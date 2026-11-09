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
  criação aplica defaults; atualização é `base.partial()`. `settingsSchema` +
  `DEFAULT_SETTINGS` definem as configurações.
- `enums.ts` — vocabulário (status da venda, formas de pagamento…) com rótulos
  pt-BR; espelha o `schema.prisma` (um teste da API falha se divergirem).
- `permissions.ts` — catálogo de permissões e rótulos.
- `sale.ts` — `priceSale` (subtotal, desconto, Taxa de serviço, total, troco, em
  centavos inteiros), `saleCode`, `SERVICE_FEE_LABEL`.
- `time.ts` — dia civil da loja (America/Sao_Paulo) para períodos e agrupamentos.

## API (`apps/api/src`)

- `modules/<domínio>/` — `controller` (rota, `@RequirePermission`, validação) →
  `service` (regra de negócio, Prisma). Serviços se compõem por injeção.
- Donos de agregado, chamados dentro da transação de quem os usa:
  - `stock/stock-ledger.ts` — único escritor de saldo, movimentos e lotes
    (Entrada, Ajustar, baixa da venda em FEFO, devolução do estorno).
  - `cash-register/cash-ledger.ts` — único escritor de movimentos de caixa e dono
    do "caixa aberto".
  - `receivables` — fiado; `sales/sales-query.ts` — venda concluída no período e
    Receita.
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
- `lib/` — `http` (erros viram `ApiError`), `session`, `query-keys`,
  `query-client`, `format`.
- `components/` — componentes de UI compartilhados, numa pasta plana.

Uma funcionalidade nova costuma ser: schema no shared → módulo na API com
permissão → `features/<f>/api.ts` + página → rota.
