# Deploy (CI/CD)

O workflow [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) roda em
todo pull request e em todo push em `main`. Cada job roda só se a parte que ele
verifica mudou; o job `changes` decide por pasta:

| Mudou                                                               | Roda                                              |
| ------------------------------------------------------------------- | ------------------------------------------------- |
| só docs (`docs/`, `*.md` fora dos apps…)                            | só o Prettier                                     |
| `apps/web/`                                                         | `web`, `lighthouse` (+ deploy do front na `main`) |
| `apps/api/` ou `railway.json`                                       | `api`, `api-e2e` (+ deploy da API)                |
| `packages/shared/` ou infra (workflow, lockfile, `package.json`, …) | tudo                                              |

`workflow_dispatch` (Actions → CI/CD → Run workflow) roda e publica tudo.

| Job          | O que faz                                                                               |
| ------------ | --------------------------------------------------------------------------------------- |
| `format`     | `prettier --check .` (sempre; não instala dependências)                                 |
| `shared`     | type-check e testes do pacote shared                                                    |
| `api`        | build (shared → api), type-check e testes unitários                                     |
| `api-e2e`    | testes e2e da API contra um Postgres 17 descartável do próprio job                      |
| `web`        | lint, build, type-check e testes                                                        |
| `lighthouse` | Lighthouse em todas as telas, com API e banco de exemplo (ver abaixo)                   |
| `ci-ok`      | verde quando nenhum job falhou (pulado conta como ok) — use este como check obrigatório |
| `deploy-api` | `railway up --ci` e smoke test (`GET /auth/me` sem token tem que dar 401)               |
| `deploy-web` | builda o web com `VITE_API_URL` e publica os estáticos na Vercel (`--prebuilt --prod`)  |

Os deploys só rodam em push na `main` com `ci-ok` verde. O front é publicado
depois da API quando os dois mudaram (as migrations rodam no start do
container da API).

### Lighthouse

O job `lighthouse` sobe um Postgres descartável com os dados de exemplo
(`db:migrate` + `db:seed:fixtures`), a API e o build de produção do web no
`vite preview`, e mede todas as telas em perfil desktop: `/login` sem sessão e
`/sale`, `/products`, `/stock`, `/financial`, `/reports` e `/settings` logado
como o admin do seed (`apps/web/lighthouse/login.cjs` grava a sessão antes de
cada página). Acessibilidade e boas práticas abaixo de 90 reprovam o PR;
desempenho abaixo de 85 e SEO abaixo de 80 só geram aviso. Páginas e limites
em `apps/web/lighthouserc.json`; ao criar uma rota nova, inclua-a lá.

As notas por página aparecem no _Summary_ da execução; os relatórios HTML
completos ficam no artefato `lighthouse`.

### Proteção da `main`

Em Settings → Branches → regra para `main`, marque _Require status checks to
pass_ e escolha **CI ok**. Não escolha os jobs individuais: quando um é pulado
por falta de mudança, só o `ci-ok` garante o resultado.

## O que configurar no GitHub

Em **Settings → Environments**, crie o environment `production` (pode exigir
aprovação manual antes do deploy, se quiser) e cadastre nele:

**Secrets**

| Nome            | Onde obter                                                                         |
| --------------- | ---------------------------------------------------------------------------------- |
| `RAILWAY_TOKEN` | Railway → projeto → Settings → Tokens → _Project token_ do environment de produção |
| `VERCEL_TOKEN`  | Vercel → Account Settings → Tokens                                                 |

**Variables**

| Nome                | Valor                                                                                 |
| ------------------- | ------------------------------------------------------------------------------------- |
| `RAILWAY_SERVICE`   | nome (ou id) do serviço da API no Railway                                             |
| `VERCEL_ORG_ID`     | `orgId` de `.vercel/project.json` (gerado por `npx vercel link` em `apps/web`)        |
| `VERCEL_PROJECT_ID` | `projectId` do mesmo arquivo                                                          |
| `VITE_API_URL`      | URL pública da API **com `/api` no fim**, ex.: `https://minha-api.up.railway.app/api` |

## O que configurar no Railway (serviço da API)

| Variável                                 | Valor                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                           | referência ao Postgres do projeto (`${{Postgres.DATABASE_URL}}`)                                                               |
| `JWT_SECRET`                             | segredo longo e aleatório — **obrigatório**: sem ele a API não sobe                                                            |
| `CORS_ORIGIN`                            | origem do front na Vercel, ex.: `https://meu-app.vercel.app` (sem barra final; várias separadas por vírgula) — **obrigatório** |
| `JWT_EXPIRES_IN`                         | opcional (padrão `12h`)                                                                                                        |
| `OBSERVE_APP_KEY` / `OBSERVE_APP_SECRET` | opcionais (telemetria)                                                                                                         |

`NODE_ENV=production` já vem do Dockerfile e o Railway injeta `PORT`.

Desligue o deploy automático pelo GitHub no serviço (Settings → Source) para
que só o workflow publique — senão um push em `main` faz deploy mesmo com teste
falhando.

## O que configurar na Vercel

O workflow builda o front e manda só os estáticos, então os comandos de build e o
_Root Directory_ do projeto na Vercel não são usados. Desligue o deploy automático
da integração Git (Project Settings → Git → _Ignored Build Step_ = `exit 0`, ou
desconecte o repositório), pelo mesmo motivo do Railway.

As rotas da SPA (qualquer caminho → `index.html`) são montadas pelo workflow no
`.vercel/output/config.json` e repetem `apps/web/vercel.json`; se mudar uma, mude a outra.
