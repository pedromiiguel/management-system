# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Management system for a beverage distributor / bar (Costas BAR): product catalog, stock, point-of-sale (PDV), customers, cash register, and financials. Domain language and UI copy are **Portuguese (pt-BR)** — keep it that way. The user-facing spec references FR-/NFR- requirement codes that appear in code comments.

**Read [CONTEXT.md](CONTEXT.md) before touching sales/stock/financial code.** It's the authoritative glossary defining precise domain verbs whose distinctions are load-bearing: `Bipar` vs `Alterar quantidade`, `Remover` (item, reversible) vs `Excluir` (product) vs `Estornar` (completed sale), `Entrada` (additive stock) vs `Ajustar` (audited correction, requires reason). Using the wrong term in code or UI is a real bug.

## Monorepo layout

npm **workspaces** (not turbo/pnpm/nx), Node >=22. Three workspaces:
- `apps/api` — `@beverage/api`, NestJS 11 + Prisma 6 + PostgreSQL
- `apps/web` — `@beverage/web`, React 19 + Vite 8 + TanStack Router/Query + Tailwind 4
- `packages/shared` — `@beverage/shared`, Zod schemas, enums, and the permission catalog shared by both apps

## Commands

Run from repo root:

```bash
npm run dev            # api + web in parallel (npm-run-all)
npm run dev:api        # NestJS watch mode only
npm run dev:web        # Vite only
npm run build          # builds shared → api → web (order matters)
npm run lint           # eslint across repo
npm run format         # prettier --write .
npm test               # api unit tests (jest)
npm run test:e2e       # api e2e tests (jest --runInBand)
npm run db:migrate     # prisma migrate deploy (in apps/api)
npm run db:seed        # prisma db seed (in apps/api)
```

Database runs via `docker compose up -d postgres` (Postgres 17 on `localhost:5432`, creds `beverage`/`beverage`). A `backup` service does daily `pg_dump` into `backups/`. The `prod` profile (`docker compose --profile prod up -d --build`) builds and runs api + web for on-site deployment.

API-only workflows (from `apps/api`): `npm run db:migrate:dev` (create/apply a dev migration), `npm run db:generate` (regenerate Prisma client after schema edits).

**Single test:** `npm test --workspace apps/api -- sales.service` (or any filename substring / `-t "test name"`). Unit specs are `*.spec.ts` colocated in `src/`; e2e specs live in `apps/api/test/` and must run serially (`--runInBand`).

**Env:** copy `apps/api/.env.example` to `apps/api/.env`. Needs `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (empty = reflect any origin, dev only).

## Architecture

### Auth & authorization (the backbone — understand this first)

Two **global** `APP_GUARD`s run on every request, registered in [app.module.ts](apps/api/src/app.module.ts):
1. `JwtAuthGuard` — validates the Bearer token. Opt a route out with `@Public()`.
2. `PermissionsGuard` — enforces the permission declared by `@RequirePermission(Permission.X)` on the handler.

Authorization is **permission-based, not role-based**. The `Permission` catalog lives in [packages/shared/src/permissions.ts](packages/shared/src/permissions.ts) (`products.read`, `sales.operate`, `sales.void`, …). A `Role` is just a configurable *set* of permissions stored in the DB — new roles (Caixa, Estoquista, Financeiro) can be created without code changes. The seed creates a system `Administrador` role holding `ALL_PERMISSIONS`. When adding a feature, add its permission to `permissions.ts` (with a pt-BR label) and gate the controller with `@RequirePermission`.

Passwords hashed with argon2; JWT via `@nestjs/jwt`.

### API module pattern

One NestJS module per domain under `apps/api/src/modules/` (auth, products, stock, sales, cash-register, customers, financial, receivables, payables, reports, settings, users). Standard shape: `*.controller.ts` (routing + `@RequirePermission` + Zod validation via `ZodValidationPipe`) → `*.service.ts` (business logic, holds all Prisma access). Global prefix is `/api`. Cross-module logic is done by injecting sibling services (e.g. `SalesService` injects `ProductsService` and `SettingsService`).

`SettingsService.get(key)` is the source of runtime-configurable behavior — e.g. `stockPolicy` (BLOCK vs. warn on insufficient stock) is read at sale time, not hardcoded.

### Money / Decimal

Monetary values are Prisma `Decimal` and **all arithmetic stays in Decimal server-side**. [main.ts](apps/api/src/main.ts) patches `Decimal.prototype.toJSON` so values serialize as JSON numbers over the wire. Don't do money math in `number` on the server; don't reintroduce float rounding.

### Validation contract

Zod schemas in `packages/shared` are the single validation contract. The API validates request bodies through `ZodValidationPipe` using these schemas; the web app uses the same schemas via `@hookform/resolvers`. Add/adjust a schema in shared rather than duplicating validation per app.

### Web app

TanStack Router with **file-based routing** (`autoCodeSplitting`) — `routeTree.gen.ts` is generated, don't hand-edit. Authenticated screens live under `routes/_app/` (pos, products, stock, financial, reports, settings); `routes/_app.tsx` guards them in `beforeLoad` (redirects to `/login` if unauthenticated) and renders the sidebar shell + `Screen` layout helper. Server state via TanStack Query; the axios instance in [lib/api.ts](apps/web/src/lib/api.ts) injects the JWT and redirects to `/login` on any 401. Styling is Tailwind 4 plus hand-authored `s-*` classes in `styles.css`.

### shared package quirk

`@beverage/shared` is built as **CommonJS** (so Nest consumes `dist/`), but Vite aliases the import straight to the TypeScript source (`packages/shared/src/index.ts`) — see [vite.config.ts](apps/web/vite.config.ts). So the web app always sees live shared source, while the **API needs `npm run build --workspace packages/shared`** (part of the root `build`) to pick up shared changes at runtime.
