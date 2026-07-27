# 0011 — Auth (login + shell) como 7º módulo, além da lista original de 6

- **Status:** Aceito (implementado)
- **Estende:** a convenção de Clean Architecture do [ADR 0003](0003-clean-architecture-piloto-pos.md); a receita de centralização de tipos do [ADR 0005](0005-centraliza-tipos-em-domain.md); a convenção de componentes do [componentes-mvvm.md](../componentes-mvvm.md)
- **Diferente das ADRs 0003-0010**: não é um dos 6 módulos da lista original de legado (`sale`/`financial`/`products`/`stock`/`reports`/`settings`, ver [glossario.md](../glossario.md)) — é escopo novo, aberto explicitamente pelo usuário depois de confirmar que a lista original está 100% completa

## Contexto

Depois do [ADR 0010](0010-clean-architecture-settings.md) fechar a lista
original de 6 módulos legados, `grill-with-docs` foi rodado de novo para
checar se sobrava algo. Inspeção confirmou: as 6 rotas em `routes/_app/` são
hoje wrappers finos de 6-7 linhas. Sobram só `routes/login.tsx` (108 linhas)
e `routes/_app.tsx` (77 linhas — o shell de navegação/sidebar + guarda de
rota + logout) — nenhum dos dois esteve na lista original, mas o usuário
optou por expandir o escopo e grillar os dois nesta rodada.

Inspeção (não suposição) confirmou:

- `login.tsx` já usa `react-hook-form` + `zod` (`loginSchema` de
  `@beverage/shared`) — **única tela legada que já seguia essa convenção**
  antes de qualquer migração. O que falta é a camada Clean Architecture: o
  `POST /auth/login` é chamado direto via `api.post` cru (não por
  `IHttpClient`/`domain/usecases`), e o arquivo tem bastante `style={{}}`
  inline (proibido por `arquiteture.md`), sem separação MVVM.
- `_app.tsx` (`AppShell`) tem sidebar, navegação, avatar do usuário e botão
  de logout, além da guarda de rota (`beforeLoad`, já correta e sem
  necessidade de mudança). **Não faz nenhuma chamada de API própria**:
  logout é só `clearSession()` (local, `lib/auth.ts`) + `navigate()`. Sem
  dado vindo de `IHttpClient`, não há nada de real pra abstrair em
  `domain/data/main` — diferente de todos os módulos anteriores.
- `lib/auth.ts` (`getToken`/`setSession`/`clearSession`/`isAuthenticated`/
  `hasPermission`, tudo sobre `localStorage`) é consumido em dois lugares
  que não podem depender de hooks/factories de `main`: o `beforeLoad` das
  rotas (`_app.tsx`, `login.tsx`) roda **fora da árvore React**, antes de
  qualquer componente montar; e `hasPermission` já é consumido por um flow
  já migrado (`ProductModal.model.ts`, ADR 0007) fora de qualquer contexto
  de request HTTP.
- `AuthService.login` (`auth.service.ts:14-21`) rejeita usuário inexistente,
  inativo (`!user.active`) ou senha errada com o mesmo
  `UnauthorizedException('Login ou senha inválidos')` — três causas, uma
  mensagem, para não vazar qual delas falhou (mitigação de enumeração de
  usuário). É a única regra de negócio real com ramificação a partir destas
  duas telas.
- `apps/e2e/tests/03-auth-guard.spec.ts` **já existe** (4 casos: redirect
  pra login sem sessão, redirect pro destino original após autenticar,
  senha errada exibe erro sem criar sessão, logout encerra sessão e bloqueia
  voltar pelo histórico) — diferente de todas as rodadas anteriores, a
  suíte E2E desta rodada **não precisa ser escrita do zero**, só continuar
  verde depois da refatoração. Nenhum dos 4 casos cobre usuário **inativo**
  especificamente (só senha errada) — gap real de cobertura.
- Não existe nenhum supertest de `auth` em `apps/api/test/`.

## Decisão

Todas as decisões abaixo foram grilled com o usuário via `AskUserQuestion`
(4 perguntas).

### 1. `_app.tsx` vira `presentation/layout/`, componentizado, sem camada de domínio própria

Decisão do usuário: criar uma pasta `presentation/layout/` e componentizar o
que for possível de dentro de `_app.tsx`. Como não há chamada de API
própria (logout é só storage local), **não nasce `domain/usecases` nem
`data/handlers` pro shell** — mesmo critério de "componente sem Model" de
`componentes-mvvm.md` quando não há dado real de `main` por trás, mas indo
além de um componente único: o shell é quebrado em

- `presentation/layout/AppShell/` — componente raiz (View pura: renderiza
  `Sidebar` + `Outlet` do router; sem Model, já que não há estado/dado
  próprio além do que `Sidebar` já carrega).
- `presentation/layout/AppShell/components/Sidebar/` — MVVM completo
  (Model: usuário da sessão via `getUser()` de `lib/auth.ts`, handler de
  logout; ViewModel: monta as iniciais do avatar; View: logo, lista de nav,
  rodapé com usuário + botão sair). `NAV` (lista de itens de navegação) vira
  `Sidebar.constants.ts` — constante local, usada só aqui.

`routes/_app.tsx` fica só com a definição da rota (`beforeLoad` da guarda,
inalterada) e `component: AppShell` importado de `presentation/layout/`.

### 2. 1 domínio `auth`, 2 unidades de apresentação

Login e shell **não compartilham tela nem rota** (diferente das abas de
`financial`/`reports`/`settings`, que justificavam 1 flow só) — por isso
viram duas unidades de apresentação distintas: `presentation/flows/login/`
(a tela) e `presentation/layout/` (o shell, decisão 1). Ambas consomem o
mesmo domínio `auth`: `domain/usecases/auth/login.ts` (`ILogin`,
verbo custom — não é CRUD de entidade), `data/handlers/auth/login-handler.ts`
(com teste unitário), `infra/endpoints/auth.ts`, `main/factories/handlers/auth.ts`,
`main/factories/mutations/auth.ts` (`useLoginMutation`). `SessionUser` migra
de `lib/auth.ts` para `domain/models/auth.ts` (mesma receita da ADR 0005);
`lib/auth.ts` passa a importar o tipo de lá (ver Decisão 3 — o arquivo em si
não migra, só o tipo).

`LoginPage` vira MVVM (Model: `useLoginMutation` + `useForm`; View: mesmo
formulário, convertido pra Tailwind). Todo `style={{}}` inline de
`login.tsx`/`_app.tsx` é convertido pra classes Tailwind, mesmo padrão de
todas as rodadas anteriores — única exceção documentada em
`arquiteture.md` (valor calculado em runtime) não se aplica aqui.

**`SolIcon` mantido para os ícones de marca** (`sun`, `pdv`, `produtos`,
`estoque`, `financeiro`, `relatorios`, `config`) — decisão explícita, não
descuido. `componentes-mvvm.md` recomenda `lucide-react` em código novo,
mas esses são glifos hi-fi específicos da marca (traço customizado, sem
equivalente 1:1 no lucide) — trocar mudaria a aparência visual da sidebar,
que é *redesign*, fora do escopo de uma refatoração estrutural (mesma
distinção da Decisão "Refatoração puramente estrutural" no glossário).
Diferente de `search`/`trash` (já trocados por `Search`/`Trash2` em modais
migrados anteriormente) — esses são genéricos, sem carga de marca.

### 3. `lib/auth.ts` fica fora da Clean Architecture — desvio documentado

Decisão do usuário: `lib/auth.ts` continua como utilitário de `lib/`,
**não migra** para `domain/data`. Motivo: `beforeLoad` do TanStack Router
roda fora da árvore React, antes de qualquer componente montar — não pode
chamar hooks nem factories de `main` (que dependem de React Query). Mover a
sessão para trás de `IHttpClient`/`domain/data` quebraria esse consumo ou
exigiria um segundo caminho de acesso não-hook, duplicando a abstração sem
ganho real. Mesmo espírito do princípio "`IHttpClient` é a única fronteira
com chamada de API real" — aqui não há chamada de API nenhuma, só
`localStorage`, então o caso de uso da abstração não se aplica.
`useLoginMutation` (Decisão 2) chama `setSession()` de `lib/auth.ts`
diretamente no `onSuccess`, mesmo padrão de antes.

### 4. Gate de teste do ADR 0001 — restrito a usuário inativo

Mesmo critério restrito das ADRs 0007-0010: supertest cobre só a única
ramificação real ainda sem cobertura — usuário inativo não pode logar mesmo
com senha correta. Login com senha errada, usuário inexistente e o fluxo de
guarda/redirect/logout **já têm cobertura E2E** (`03-auth-guard.spec.ts`,
existente, sem necessidade de nova suíte) — não entram no gate de supertest
por já estarem verificados, mesmo critério de não duplicar cobertura já
existente.

1. **Supertest** (`apps/api/test/auth.e2e-spec.ts`) cobrindo: usuário
   inativo com senha correta é rejeitado (`401`); usuário ativo com senha
   correta autentica normalmente (controle).
2. **Suíte E2E**: `03-auth-guard.spec.ts` já existe e cobre o caminho feliz
   de login/logout/guarda — roda de novo ao final da migração como
   verificação de não-regressão, sem casos novos.

## Faseamento (mesmo espírito das ADRs 0006-0010 — verde a cada fatia)

1. Supertest de usuário inativo (`apps/api/test/auth.e2e-spec.ts`).
2. `domain/models/auth.ts` (`SessionUser`, `LoginResult`) +
   `domain/usecases/auth/login.ts` + `data/handlers/auth/login-handler.ts`
   (com teste unitário) + `infra/endpoints/auth.ts` +
   `main/factories/handlers/auth.ts` + `main/factories/mutations/auth.ts` —
   código novo, morto, não conectado. `03-auth-guard.spec.ts` não deveria
   mudar de resultado.
3. `presentation/flows/login/LoginPage/` consome `useLoginMutation`;
   `routes/login.tsx` vira wrapper fino. `presentation/layout/AppShell/` +
   `components/Sidebar/` consomem `lib/auth.ts` direto (Decisão 3);
   `routes/_app.tsx` vira wrapper fino (guarda inalterada). `lib/auth.ts`
   ganha `SessionUser` reexportado de `domain/models/auth.ts`. As duas
   suítes (`auth.e2e-spec.ts` e `03-auth-guard.spec.ts`) rodam de novo —
   ponto real de risco.

## Alternativas rejeitadas

- **Forçar `domain/usecases`/`data/handlers` pro shell mesmo sem chamada de
  API própria**: rejeitado — criaria uma camada sem nenhum dado real por
  trás, puro ritual estrutural (Speculative Generality).
- **Deixar `_app.tsx` como está, fora de escopo nesta rodada**: rejeitado
  pelo usuário — optou por componentizar o shell também, não só `login.tsx`.
- **1 flow `auth` único para login + shell**: rejeitado — as duas telas não
  compartilham rota nem tela, diferente do racional que uniu as abas de
  `financial`/`reports`/`settings` num flow só.
- **Mover `lib/auth.ts` pra `domain/data`**: rejeitado pelo usuário —
  quebraria o consumo direto por `beforeLoad` (fora da árvore React) sem
  ganho real de abstração, já que não há chamada de API por trás.
- **Ampliar o gate de supertest** para cobrir geração de JWT, payload,
  `/auth/me`: rejeitado — fora do escopo das duas telas grilled nesta
  rodada (`/auth/me` não é consumido por nenhuma delas hoje).

## Consequências

- Suíte supertest (`apps/api/test/auth.e2e-spec.ts`, 2 casos) cobre usuário
  inativo rejeitado e usuário ativo autenticando normalmente (controle) —
  2/2 verdes. Rodando com `products`/`financial`/`stock`/`reports`/`users`:
  35/35 verdes, sem regressão nos módulos já migrados.
- `apps/e2e/tests/03-auth-guard.spec.ts` (já existente, sem caso novo) rodou
  de novo contra o `login.tsx`/`_app.tsx` refatorados — 4/4 verdes
  (redirect sem sessão, redirect ao destino original após autenticar,
  credenciais inválidas, logout + bloqueio de voltar pelo histórico). Suíte
  completa do projeto: 69/69 verdes.
- 1 usecase novo: `ILogin` em `domain/usecases/auth`, com handler + teste
  unitário — 58/58 testes verdes em `apps/web` (suíte completa, 1 novo).
  Typecheck (`tsc --noEmit`) limpo em `apps/api` e `apps/web`.
- `SessionUser` migrou de `lib/auth.ts` para `domain/models/auth.ts`
  (mesma receita da ADR 0005); `lib/auth.ts` reexporta o tipo e continua
  fora da Clean Architecture (Decisão 3) — `getToken`/`setSession`/
  `clearSession`/`isAuthenticated`/`hasPermission` inalterados.
- `login.tsx` (108 linhas, 1 arquivo) virou `presentation/flows/login/
  LoginPage/` (MVVM completo — `useSearch({ from: '/login' })` no lugar de
  `Route.useSearch()` pra evitar import circular com o arquivo de rota, sem
  mudar comportamento). `routes/login.tsx` é hoje um wrapper de 12 linhas
  (mantém `validateSearch`/`beforeLoad`, que são configuração de rota, não
  lógica de página).
- `_app.tsx` (77 linhas, 1 arquivo) virou `presentation/layout/AppShell/`
  (View pura, sem Model — só compõe `Sidebar` + `Outlet`) +
  `AppShell/components/Sidebar/` (MVVM completo: Model lê `getUser()` e
  expõe `logout`; `NAV` vira `Sidebar.constants.ts`). `routes/_app.tsx` é
  hoje um wrapper de 12 linhas (guarda `beforeLoad` inalterada). O
  `export { Screen }` de `_app.tsx` (reexport morto — nenhum arquivo mais
  importava `Screen` daqui, todos os flows já migrados importam direto de
  `presentation/components/Screen`) foi removido.
- Todo `style={{}}` inline de `login.tsx`/`_app.tsx` convertido pra classes
  Tailwind (incl. arbitrárias como `text-[13.5px]`, `text-[color:var(--sol-900)]`),
  mesmo padrão de todas as rodadas anteriores. Única exceção mantida:
  `marginTop` no `SBtn` via prop `style` (o design system não aceita
  `className` em `SBtn`), mesmo precedente já documentado em `CreditPanel`
  (PDV).
- Verificado via E2E (não no browser interativo, mas contra a API real e o
  Vite dev server): login com credenciais corretas/erradas, redirect ao
  destino original, logout com bloqueio de histórico, e a sidebar
  navegando entre as 6 telas — tudo funcionando de ponta a ponta.
