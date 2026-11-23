# API (`@beverage/api`)

NestJS 11 + Prisma 6 + PostgreSQL. Um módulo por domínio em `src/modules/`; visão
geral em [docs/arquitetura.md](../../docs/arquitetura.md#api-appsapisrc).

## Autenticação e autorização (entenda isto primeiro)

O `AuthModule` registra dois `APP_GUARD` **globais**, que rodam em toda requisição.
Guards e decorators (`@Public`, `@RequirePermission`, `@CurrentUser`/`AuthUser`)
moram juntos em `modules/auth/`.

1. `JwtAuthGuard` valida o Bearer token (o JWT só carrega `sub`). `@Public()` libera a rota.
2. `PermissionsGuard` exige a permissão declarada em `@RequirePermission(Permission.X)`.

Usuário e permissões são **resolvidos a cada requisição** pelo `SessionService`
(cache curto, limpo em qualquer mudança de usuário/papel): desativar alguém ou mudar
um papel vale na hora, não quando o token expira. Um `Role` é um conjunto
configurável de permissões no banco; o papel de sistema `Administrador` sempre tem
`ALL_PERMISSIONS` em tempo de execução (pode ser renomeado, não perde permissões).
Senhas com argon2; JWT com `@nestjs/jwt`. Permissão nova → skill `nova-permissao`.

## Forma de um módulo

`*.controller.ts` (rota + `@RequirePermission` + validação Zod do corpo **e da query**
com `ZodValidationPipe` e os schemas do shared) → `*.service.ts` (regra de negócio,
Prisma). Prefixo global `/api`. `configureApp(app)` (prefixo, CORS, filtro de erros do
Prisma, serialização de Decimal) é o mesmo no `main.ts` e nos testes e2e.

## Ledgers são donos das suas tabelas

Outros serviços chamam o ledger dentro da própria transação (`tx`); nunca escrevem
nessas tabelas direto.

- `StockLedger` — único escritor de `product.currentStock`, `stock_movement`,
  `product_batch`, `stock_movement_batch`: `entry`, `adjust`, `exitForSale` (FEFO),
  `returnForVoid` (volta aos mesmos lotes), `checkAvailability` (a única decisão
  "estoque insuficiente × `stockPolicy`"), `deleteProductRows`.
- `CashLedger` — único escritor de `cash_movement` e dono do "caixa aberto": recebimentos
  de venda, devoluções de estorno (sempre no caixa aberto agora), movimentos de gaveta,
  despesas. Categorias financeiras de sistema são achadas pelo `code` estável
  (`SystemCategory`), não pelo nome; quem as cria é uma migration, não o seed.
- `ReceivablesService` — fiado (`createForSale` / `cancelForSale` / `openBalances`).
- `SalesQuery` — "venda concluída no período" e a definição única de Receita usada pelo
  painel e pelos relatórios.

## Configurações

`SettingsService` é a fonte do comportamento configurável. Chaves (`SETTING_KEYS`),
validação por valor (`parseSetting`) e defaults (`DEFAULT_SETTINGS`) vêm de um schema
só no shared; cada valor do banco é validado na leitura (cai no default se inválido).
Linhas de configuração não são semeadas: linha ausente = default. Ex.: `stockPolicy`
(BLOCK × WARN) é lido na hora da venda.

## Dinheiro

Valores monetários são `Decimal` do Prisma. Precificação da venda é o `priceSale` do
shared (centavos inteiros, arredondamento half-up), convertido de volta para Decimal.
`Sale.total` é sempre o **valor devido** (inclui a Taxa de serviço quando ligada). O
resto da matemática de dinheiro fica em Decimal; `configureApp` faz o Decimal sair como
número no JSON. Sem float, sem reintroduzir diferença de arredondamento.

## Contrato

Base schemas sem `.default()`; defaults só nos schemas de criação; update é
`base.partial()` (um PATCH nunca reescreve o que não mandou). Os enums do shared
espelham o `schema.prisma` (`src/common/shared-enums.spec.ts` falha se divergirem).

## Ambiente

`src/config/env.ts` carrega `apps/api/.env` fora de produção (env do processo vence) e
valida com Zod na subida: `DATABASE_URL` obrigatório; `JWT_SECRET` obrigatório em
produção; `JWT_EXPIRES_IN` (default `12h`); `PORT`; `CORS_ORIGIN` (separado por vírgula,
obrigatório em produção; vazio reflete qualquer origem fora dela); `OBSERVE_APP_KEY` /
`OBSERVE_APP_SECRET` opcionais.

## Banco

- `npm run db:migrate:dev` cria/aplica migration de dev (leia a skill
  `nova-migration-prisma` antes: há índices parciais que o Prisma tenta apagar).
- `npm run db:generate` regenera o client depois de editar o schema (roda também no
  `postinstall`).

Testes da API: [docs/agentes/testes.md](../../docs/agentes/testes.md).
