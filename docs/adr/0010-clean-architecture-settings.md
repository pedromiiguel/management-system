# 0010 — Settings como 6º e último módulo legado da Clean Architecture

- **Status:** Aceito (implementado)
- **Estende:** o padrão promovido a convenção de repo pela [ADR 0006](0006-clean-architecture-financial-promove-convencao.md); a receita de migração de tipos do [ADR 0005](0005-centraliza-tipos-em-domain.md); a convenção de componentes do [componentes-mvvm.md](../componentes-mvvm.md)
- **Segue o precedente de dono do agregado** fixado pelas ADRs [0007](0007-clean-architecture-products.md) e [0009](0009-clean-architecture-reports.md) ("usecase pertence a quem é dono do agregado, não a quem usa primeiro nem à permissão do endpoint")

## Contexto

Depois de `sale` (ADR 0003), `financial` (ADR 0006), `products` (ADR 0007),
`stock` (ADR 0008) e `reports` (ADR 0009), `settings.tsx` (458 linhas) era o
último candidato da lista original de módulos legados (ver
[glossario.md](../glossario.md)).

Diferente de todas as rodadas anteriores, `settings.tsx` não é "1 domínio com
abas" — é uma tela com 3 abas (`SSeg`) que tocam **3 domínios de permissão
diferentes**:

- **Geral** (NFR-10): política de estoque insuficiente (BR-03/FR-15), formas
  de pagamento habilitadas (FR-17), meta de faturamento (FR-36), alerta de
  validade (FR-08). `GET /settings` **não tem** `@RequirePermission` (qualquer
  autenticado lê); só `PUT /settings` exige `settings.write`.
- **Usuários & Perfis** (NFR-05): CRUD de usuários e perfis/matriz de
  permissões. Todo o controller (`UsersController`) é gated por
  `@RequirePermission(Permission.USERS_MANAGE)` — permissão própria, distinta
  de `settings.write`.
- **Categorias financeiras** (NFR-10): lista e cria categorias de
  receita/despesa. `GET /financial/categories` exige `financial.read`; **`POST
  /financial/categories` exige `settings.write`** (não `financial.write`) —
  provavelmente porque só quem administra o sistema cadastra categoria, não
  quem opera o financeiro no dia a dia.

Inspeção (não suposição) confirmou:

- **Nenhuma cobertura de teste** para `settings`/`users`: sem spec em
  `apps/api/test/`, sem spec em `apps/e2e/tests/`.
- `AppSettings`, `Role` e `UserRow` **ainda vivem em `lib/types.ts`** (não em
  `domain/models/`) — nenhum domínio os reivindicou ainda, diferente de
  `FinancialCategory`/`Sale`/`Product`, que já migraram nas ADRs anteriores e
  só são reexportados por `lib/types.ts` como shim.
- `AccessTab` chama `/users`, `/users/roles/all`, `/users/roles` e
  `/users/roles/:id` cru via `api.get`/`api.post`/`api.patch`. Não existe
  `domain/usecases/users` hoje.
- `CategoriesTab` **bypassa `ISearchFinancialCategory`** (já existe em
  `domain/usecases/financial` desde a ADR 0006, consumido hoje por
  `useFinancialCategoriesQuery` no flow `financial`) com um `api.get` cru —
  duplicação real, não hipotética. Falta um usecase de criação
  (`ICreateFinancialCategory` não existe em lugar nenhum).
- **Única regra de negócio real com ramificação alcançável a partir de
  `settings.tsx`**: `updateRole` (`users.service.ts:52-58`) bloqueia alterar
  as permissões do papel `Administrador` (`system: true`) — guarda contra
  lockout, `BadRequestException`. Todo o resto é CRUD simples
  (`createUser`/`updateUser`/`createRole`/`getAll`/`update` de settings) sem
  branching de regra de negócio.
- Verificado: `PrismaExceptionFilter` (`common/filters/prisma-exception.filter.ts`)
  já converte violação de unicidade (`login`/nome de papel, `P2002`) em `409`
  de forma genérica — **não é um bug a corrigir nesta rodada**, diferente do
  achado de timezone da ADR 0009.

## Decisão

Todas as decisões abaixo foram grilled diretamente com o usuário via
`AskUserQuestion` (4 perguntas, mesmo método das rodadas anteriores quando as
skills `/grilling`/`/domain-modeling` não estão instaladas localmente —
`/domain-modeling` foi buscado com sucesso via `gh api repos/mattpocock/skills`
nesta rodada, mesmo método da ADR 0008; `/grilling` seguiu confirmado como
linguagem descritiva, não uma skill real).

### 1. Escopo: um único flow `settings`, 3 abas locais — mesmo padrão do `financial`/`reports`

Apesar da divergência de domínio de permissão ser maior aqui que em
`financial`/`reports` (3 permissões distintas, não 1), a tela/rota continua
sendo uma só. Mesmo racional da Decisão 1 da ADR 0006 (abas compartilham
rota/navegação/contexto de tela) e precedente já parcial da ADR 0009 (o flow
`reports` já misturava usecases de `reports` e `sale`). `settings.tsx` vira
`presentation/flows/settings/`, com `GeneralTab`/`AccessTab`/`CategoriesTab`
como `components/` locais MVVM. Sem
`main/factories/flows/use-settings-flow.ts` — as abas não compartilham um
agregado único, mesmo padrão do `financial`/`products`/`reports`.

### 2. `domain/usecases/users` nasce como domínio próprio

`User` e `Role` são agregados com módulo NestJS e permissão própria
(`users.manage`), não uma sub-parte de `settings` — mesmo raciocínio que
moveu `Product` para seu próprio domínio na ADR 0007. Nascem
`ISearchUser`/`ICreateUser`/`IUpdateUser` e
`ISearchRole`/`ICreateRole`/`IUpdateRole` (vocabulário CRUD padrão de
`arquiteture.md`, usando `CreateUserInput`/`UpdateUserInput`/`RoleInput` já
existentes em `@beverage/shared`). `Role` e `UserRow` migram de
`lib/types.ts` para `domain/models/users.ts` (mesma receita da ADR 0005).
`AccessTab` (local do flow `settings`) consome as factories de `users` —
import cruzando de `settings` para `users`, mesma direção que
`ProductsPage→stock` (ADR 0008) e `SalesTab→sale` (ADR 0009) já
estabeleceram: cross-flow import é o padrão quando um domínio nasce dentro da
tela de outro, não uma exceção nova.

### 3. `domain/usecases/settings` nasce para a aba Geral

`IGetSettings`/`IUpdateSettings` (verbos custom — `settings` é um recurso
singleton, não uma entidade com `id`, então não usa o par `GetOne`/`Update`
genérico). `AppSettings` migra de `lib/types.ts` para
`domain/models/settings.ts`.

### 4. `ICreateFinancialCategory` nasce em `domain/usecases/financial`, ao lado do `ISearchFinancialCategory` existente

Decisão tomada em diálogo com o usuário: mesmo com `POST
/financial/categories` exigindo `settings.write` (não `financial.write`), o
usecase segue o dono do agregado (`FinancialCategory`, que já mora em
`domain/models/financial.ts` desde a ADR 0006), não a permissão do endpoint —
mantém o critério "agregado > permissão" já fixado nas ADRs 0007/0009, mesmo
quando a permissão aponta para outro domínio. `CategoriesTab` troca o
`api.get('/financial/categories')` cru pela query **já existente**
`useFinancialCategoriesQuery` (`main/factories/queries/financial.ts:55-60`,
hoje só consumida pelo flow `financial`) e ganha uma nova
`useCreateFinancialCategoryMutation`, também em `financial`. Mesma direção de
import cross-flow da Decisão 2 (`settings→financial`).

### 5. Gate de teste do ADR 0001 — escopo restrito à guarda de lockout do papel Admin

Mesmo critério restrito das ADRs 0007-0009 (não o gate total da ADR 0006): o
supertest cobre só a guarda de `updateRole` contra alterar permissões do
papel `system` (`Administrador`). Resto (CRUD de usuário/perfil/categoria,
leitura/escrita de settings) fica fora do gate — sem ramificação de negócio
real, ganha teste unitário de handler na fase 3, mesmo padrão das rodadas
anteriores.

1. **Supertest** (`apps/api/test/users.e2e-spec.ts`) cobrindo: guarda contra
   alterar permissões do papel `system` (`ConflictException`/`BadRequestException`
   conforme o código atual); guarda de permissão `USERS_MANAGE` no controller.
2. **Suíte E2E** (`apps/e2e/tests/10-configuracoes.spec.ts`) cobrindo as 3
   abas: troca de política de estoque/formas de pagamento/meta/alerta de
   validade (Geral); criação de usuário e de perfil + matriz de permissões
   sem poder editar o papel Admin (Acesso); criação de categoria financeira
   (Categorias). Caminho feliz de UI↔API, não a ramificação de negócio (já
   coberta pelo supertest).

### 6. Escopo de mudança: permite correções pontuais

Mesmo precedente das ADRs 0002/0006/0007/0008/0009 — mas nesta rodada a
inspeção **não achou nenhum bug real** (diferente do timezone da ADR 0009);
o único ponto que parecia suspeito (unicidade de `login`/nome de papel) já é
tratado de forma genérica pelo `PrismaExceptionFilter` existente.

### 7. Fecha a lista original de módulos legados

Depois desta rodada, `sale`/`financial`/`products`/`stock`/`reports`/`settings`
— os 6 módulos identificados desde a ADR 0001 — estarão todos em Clean
Architecture. Não há mais candidato conhecido na lista original; qualquer
rodada futura de `grill-with-docs` parte de escopo novo (feature nova, não
módulo legado pendente).

## Faseamento (mesmo espírito das ADRs 0006-0009 — verde a cada fatia)

1. Supertest da guarda de lockout (`apps/api/test/users.e2e-spec.ts`).
2. Suíte E2E das 3 abas (`apps/e2e/tests/10-configuracoes.spec.ts`) contra
   `settings.tsx` atual.
3. `domain/models/{settings,users}.ts` + `domain/usecases/settings/*` (2
   usecases) + `domain/usecases/users/*` (6 usecases) +
   `domain/usecases/financial/create-financial-category.ts` (1 usecase novo)
   + `data/handlers/{settings,users,financial}/*` (cada um com teste
   unitário) + `infra/endpoints/{settings,users}.ts` + entrada nova em
   `financialEndpoints` (a URL `/financial/categories` já existe, só ganha o
   verbo `POST`) + `main/factories/{queries,mutations}/{settings,users,financial}`
   — código novo, morto, não conectado. As duas suítes da fase 1-2 não
   deveriam mudar de resultado.
4. `presentation/flows/settings/` consome as factories;
   `routes/_app/settings.tsx` vira wrapper fino. As suítes de `settings` e
   `financial` rodam de novo — ponto real de risco.

## Alternativas rejeitadas

- **3 flows separados** (`settings`/`users`/`categorias`, um por domínio):
  rejeitado pelo usuário — a tela/rota continua sendo uma só hoje; separar
  infla estrutura sem separar comportamento observável (mesmo motivo que
  rejeitou "4 flows por aba" na ADR 0009).
- **`domain/usecases/users` dentro de `settings`**: rejeitado — `User`/`Role`
  têm módulo e permissão própria (`users.manage`), mesmo critério que deu a
  `Product` seu próprio domínio na ADR 0007.
- **`ICreateFinancialCategory` em `domain/usecases/settings`** (seguindo a
  permissão `settings.write` do endpoint): rejeitado pelo usuário — inverteria
  o critério "agregado > permissão" já fixado nas ADRs 0007/0009 sem motivo
  novo; a permissão aqui é só um detalhe de quem administra, não muda o dono
  conceitual do agregado.
- **Ampliar o gate de supertest** para cobrir CRUD simples de
  usuário/perfil/categoria: rejeitado — sem ramificação de negócio real,
  mesmo critério de escopo restrito das ADRs 0007-0009.

## Consequências

- Suíte supertest (`apps/api/test/users.e2e-spec.ts`, 4 casos) cobre a guarda
  de lockout do papel `Administrador` e a guarda de permissão `USERS_MANAGE`
  — 4/4 verdes. Rodando com `products`/`financial`/`stock`/`reports`: 33/33
  verdes, sem regressão nos módulos já migrados.
- Suíte E2E (`apps/e2e/tests/10-configuracoes.spec.ts`, 9 casos) cobre as 3
  abas: política de estoque/formas de pagamento/meta/alerta de validade
  (Geral), criação de perfil e usuário (Usuários & Perfis), listagem e
  criação de categoria financeira (Categorias) — 9/9 verdes. Suíte completa
  do projeto (todos os arquivos): 69/69 verdes.
- 13 usecases novos: 2 em `domain/usecases/settings` (`IGetSettings`,
  `IUpdateSettings`), 6 em `domain/usecases/users` (`ISearchUser`,
  `ICreateUser`, `IUpdateUser`, `ISearchRole`, `ICreateRole`, `IUpdateRole`)
  e 1 em `domain/usecases/financial` (`ICreateFinancialCategory`), cada um
  com handler + teste unitário — 57/57 testes verdes em `apps/web` (suíte
  completa, 9 novos). Typecheck (`tsc --noEmit`) limpo em `apps/api` e
  `apps/web`.
- `AppSettings` migrou de `lib/types.ts` para `domain/models/settings.ts`;
  `Role`/`UserRow` migraram para `domain/models/users.ts` — mesma receita da
  ADR 0005. Isso esgotou o último consumidor do shim `lib/types.ts`
  (`reports.tsx` já importava direto de `domain/models` desde a ADR 0009):
  **o arquivo inteiro virou código morto e foi removido**, não apenas
  reduzido. `lib/cupom.ts` (única outra referência ao módulo, via `Sale`)
  passou a importar direto de `domain/models/sale` — achado do gate, não
  decisão de arquitetura, mesmo precedente de correção pontual das ADRs
  0002/0006-0009.
- `settings.tsx` (458 linhas, 1 arquivo) virou `presentation/flows/settings/`
  — `SettingsPage` (Model/ViewModel/View, estado de aba elevado à página,
  mesmo padrão do `FinancialPage`) + 3 componentes locais MVVM (`GeneralTab`,
  `AccessTab` com `UserModal`/`RoleModal` aninhados, `CategoriesTab`).
  `routes/_app/settings.tsx` é hoje um wrapper de 6 linhas. Sem
  `main/factories/flows/use-settings-flow.ts` — mesmo padrão do
  `financial`/`products`/`reports` (abas não compartilham um agregado único).
- `CategoriesTab` para de bypassar `ISearchFinancialCategory` com `fetch` cru
  — passa a consumir a query `useFinancialCategoriesQuery` já existente em
  `main/factories/queries/financial.ts` (antes só usada pelo flow
  `financial`), mais a nova `useCreateFinancialCategoryMutation`.
- Verificado manualmente via E2E (não no browser interativo, mas contra a API
  real e o Vite dev server): as 3 abas, alternância de política/formas de
  pagamento/meta/alerta de validade, criação de perfil com matriz de
  permissões, criação de usuário vinculado a um perfil e criação de categoria
  financeira — tudo funcionando de ponta a ponta.
- `settings` fecha a lista original de 6 módulos legados
  (`sale`/`financial`/`products`/`stock`/`reports`/`settings`). Não há mais
  candidato conhecido pendente de migração.
