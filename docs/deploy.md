# Deploy (CI/CD)

O workflow [`.github/workflows/ci-cd.yml`](../.github/workflows/ci-cd.yml) roda em
todo pull request e em todo push em `main`:

| Job          | O que faz                                                                                   | Quando           |
| ------------ | ------------------------------------------------------------------------------------------- | ---------------- |
| `checks`     | `npm ci`, lint, Prettier, build (shared → api → web), type-check, testes unitários          | sempre           |
| `api-e2e`    | testes e2e da API contra um Postgres 17 descartável do próprio job                          | sempre           |
| `deploy-api` | `railway up --ci`: o Railway builda `apps/api/Dockerfile` (via `railway.json`) e sobe a API | push em `main`\* |
| `deploy-web` | builda o web com `VITE_API_URL`, publica os estáticos na Vercel (`--prebuilt --prod`)       | push em `main`\* |

\* Só se `checks` e `api-e2e` passarem; o front só é publicado depois que a API
subiu (as migrations rodam no start do container da API).

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
