# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Management system for a beverage distributor / bar (Costa's Espetos): product catalog, stock, point-of-sale (PDV), customers, cash register, and financials. Domain language and UI copy are **Portuguese (pt-BR)** — keep it that way. The user-facing spec references FR-/NFR-/BR- requirement codes that appear in code comments.

**Read [CONTEXT.md](CONTEXT.md) before touching sales/stock/financial code.** It's the authoritative glossary defining precise domain verbs whose distinctions are load-bearing: `Bipar` vs `Alterar quantidade`, `Remover` (item, reversible) vs `Excluir` (product) vs `Cancelar` (in-progress sale → `CANCELLED`) vs `Estornar` (completed sale → `VOIDED`), `Entrada` (additive stock) vs `Ajustar` (audited correction, requires reason), and what `Receita` and `Sale.total` mean. Using the wrong term in code or UI is a real bug.

Architecture overview: [docs/arquitetura.md](docs/arquitetura.md). Decisions: [docs/adr/](docs/adr/) (current web structure: ADR 0014).

## Monorepo layout

npm **workspaces** (not turbo/pnpm/nx), Node >=22. Four workspaces:

- `apps/api` — `@beverage/api`, NestJS 11 + Prisma 6 + PostgreSQL
- `apps/web` — `@beverage/web`, React 19 + Vite 8 + TanStack Router/Query + Tailwind 4
- `apps/e2e` — `@beverage/e2e`, Playwright suite (Chromium) driving web + api
- `packages/shared` — `@beverage/shared`, Zod schemas, enums/labels, sale pricing, store-day time helpers and the permission catalog shared by both apps

## Commands

Run from repo root:

```bash
npm run dev            # api + web in parallel (predev:api builds shared first)
npm run dev:api        # NestJS watch mode only (builds shared first)
npm run dev:web        # Vite only
npm run build          # builds shared → api → web (order matters)
npm run lint           # eslint — apps/web only (config in apps/web)
npm run typecheck      # tsc --noEmit: shared + api + web (web needs routeTree.gen.ts: run the web build or dev first)
npm run format         # prettier --write .
npm test               # api jest (unit) + shared vitest + web vitest — no shared build needed
npm run test:e2e:api   # api e2e (jest --runInBand, real Postgres)
npm run test:e2e       # Playwright (apps/e2e); starts/reuses dev:api + dev:web on 3000/5173
npm run db:migrate     # prisma migrate deploy
npm run db:seed        # base seed only (admin + system role, suggested categories) — idempotent
npm run db:seed:fixtures  # base + example data (products, customer, open register, fiado)
npm run db:reset       # migrate reset + seed with fixtures (used by Playwright)
```

CI/CD: `.github/workflows/ci-cd.yml` runs only the jobs whose paths changed (docs-only → just Prettier): shared, api (build/type-check/unit), api-e2e, web (lint/build/type-check/tests), lighthouse (every screen, logged in via a seeded API; `apps/web/lighthouserc.json`); `CI ok` is the single required check. On `main` it then deploys the API to Railway and/or the web to Vercel. Secrets/variables: [docs/deploy.md](docs/deploy.md).

Database runs via `docker compose up -d postgres` (Postgres 17 on `localhost:5432`, creds `beverage`/`beverage`, database `beverage`). A `backup` service does daily `pg_dump` into `backups/`. The `prod` profile (`docker compose --profile prod up -d --build`) builds and runs api + web (`docker/web.Dockerfile`, nginx proxying `/api`); it requires `JWT_SECRET`.

API-only workflows (from `apps/api`): `npm run db:migrate:dev` (create/apply a dev migration), `npm run db:generate` (regenerate Prisma client after schema edits; also runs on `postinstall`).

Two partial unique indexes exist only in SQL (migration `20261109130100`: one OPEN cash register, one IN_PROGRESS sale per operator) — Prisma can't express them, so `prisma migrate dev` generates `DROP INDEX` for them: **delete those lines from the generated migration** before applying. `test/schema.e2e-spec.ts` fails if either index is missing.

**Single test:** `npm test --workspace apps/api -- shared-enums` (filename substring or `-t "name"`); `npm test --workspace apps/web -- receipt`; `npm test --workspace packages/shared`. API unit specs are `*.spec.ts` colocated in `src/`; API e2e specs live in `apps/api/test/` (`*.e2e-spec.ts`, shared harness in `test/support/`: one `migrate reset` per run, refuses `NODE_ENV=production` and non-localhost hosts, `createTestApp()` uses the production `configureApp`). Jest and vitest map `@beverage/shared` to its TypeScript source.

**Never run the e2e suites (`test:e2e:api`, `test:e2e`) against the store's database** — they wipe whatever `DATABASE_URL` points to, and the guard cannot tell the dev database from the store's on the same machine.

**Env:** copy `apps/api/.env.example` to `apps/api/.env`. [config/env.ts](apps/api/src/config/env.ts) loads that file outside production (process env wins) and validates with Zod at boot: `DATABASE_URL` required; `JWT_SECRET` required in production (dev fallback otherwise); `JWT_EXPIRES_IN` (default `12h`); `PORT`; `CORS_ORIGIN` (comma-separated; required in production, empty = reflect any origin outside it); optional `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET`.

## Architecture

### Auth & authorization (the backbone — understand this first)

`AuthModule` registers two **global** `APP_GUARD`s that run on every request. Guards and decorators (`@Public`, `@RequirePermission`, `@CurrentUser`/`AuthUser`) live together in `modules/auth/`:

1. `JwtAuthGuard` — validates the Bearer token (the JWT carries only `sub`). Opt a route out with `@Public()`.
2. `PermissionsGuard` — enforces the permission declared by `@RequirePermission(Permission.X)` on the handler.

User and permissions are **resolved per request** by `SessionService` (short cache, cleared on any user/role change) — deactivating a user or changing a role takes effect immediately, not when the token expires.

Authorization is **permission-based, not role-based**. The `Permission` catalog lives in [packages/shared/src/permissions.ts](packages/shared/src/permissions.ts) (`products.read`, `sales.operate`, `sales.void`, …). A `Role` is a configurable _set_ of permissions stored in the DB. The system `Administrador` role always has `ALL_PERMISSIONS` at runtime (no reseed needed for new permissions); it can be renamed but not lose permissions. When adding a feature, add its permission to `permissions.ts` (with a pt-BR label) and gate the controller with `@RequirePermission`.

Passwords hashed with argon2; JWT via `@nestjs/jwt`.

### API module pattern

One NestJS module per domain under `apps/api/src/modules/` (auth, products, stock, sales, cash-register, customers, financial, receivables, payables, reports, settings, users). Standard shape: `*.controller.ts` (routing + `@RequirePermission` + Zod validation of body **and query** via `ZodValidationPipe` with shared schemas) → `*.service.ts` (business logic, Prisma access). Global prefix `/api`; `configureApp(app)` (prefix, CORS, Prisma error filter, Decimal serialization) is shared by `main.ts` and the e2e tests.

**Ledgers own their tables** — other services call them inside their own transaction (`tx`), never write those tables directly:

- `StockLedger` (`stock/stock-ledger.ts`) — only writer of `product.currentStock`, `stock_movement`, `product_batch`, `stock_movement_batch`: `entry`, `adjust`, `exitForSale` (FEFO), `returnForVoid` (back to the same batches), `checkAvailability` (the one "insufficient stock × `stockPolicy`" decision), `deleteProductRows`.
- `CashLedger` (`cash-register/cash-ledger.ts`) — only writer of `cash_movement` and owner of "the open register": sale receipts, void refunds (always to the register open now), drawer movements, expenses. System financial categories are found by stable `code` (`SystemCategory`), not name; they are created by a migration (not the seed), so every database has them.
- `ReceivablesService` owns fiado (`createForSale` / `cancelForSale` / `openBalances`); `SalesQuery` (`sales/sales-query.ts`) owns "completed sale in period" and the single revenue definition used by dashboard and reports.

`SettingsService` is the source of runtime-configurable behavior: keys (`SETTING_KEYS`), per-value validation (`parseSetting`) and defaults (`DEFAULT_SETTINGS`) come from one settings schema in shared, and each DB value is validated on read (falls back to default). Setting rows are not seeded — a missing row means the default; a row is written only when someone saves that setting. E.g. `stockPolicy` (BLOCK vs WARN) is read at sale time.

### Money / Decimal

Monetary values are Prisma `Decimal`. Sale pricing (subtotal, discount, service fee, total, change) is the pure `priceSale` in shared — integer cents, half-up — used by the API (converted back to Decimal) and the web. `Sale.total` is always the **amount due** (includes the service fee when on). Other server-side money math stays in Decimal. `configureApp` patches `Decimal.prototype.toJSON` so values serialize as JSON numbers. Don't do float money math; don't reintroduce rounding drift.

### Validation contract

Zod schemas in `packages/shared` are the single validation contract (bodies and query strings). Base schemas have no `.default()`; defaults live only in create schemas, and update schemas are `base.partial()` — a PATCH never rewrites fields it didn't send. The web uses the same schemas via `@hookform/resolvers`, so forms must supply their own `defaultValues`. Add/adjust a schema in shared rather than duplicating validation per app. Enums in shared mirror `schema.prisma` (`src/common/shared-enums.spec.ts` fails if they diverge).

### Web app — organized by feature

- `src/routes/` — TanStack Router **file-based routing** (`autoCodeSplitting`); `routeTree.gen.ts` is generated, don't hand-edit. Routes are thin: `login`, `index`, and under `_app/` (guarded in `beforeLoad`, renders `AppShell`): `sale` (PDV), `products`, `stock`, `financial`, `reports`, `settings`.
- `src/features/<feature>/` — everything that changes together: `api.ts` (typed HTTP functions, `queryOptions`, mutation hooks that invalidate every resource the server effect touches), pages and components as plain `.tsx`, and pure logic with colocated vitest tests (e.g. `sale/receipt.ts`, `sale/sale-queue.ts`). Features: auth, sale, products, stock, financial, reports, settings, users. Across features, import only `api.ts` and the named entry components listed in [docs/arquitetura.md](docs/arquitetura.md) (enforced by ESLint `no-restricted-imports`). Response types live in each feature's `api.ts` (shared exports only input types, `AppSettings` and enums).
- `src/lib/` — `http.ts` (axios instance, JWT injection, errors normalized to `ApiError`, logout on 401), `session.ts` (`useSession`, `hasPermission`, `startSession`, `logout` — the only exit, also clears the query cache), `session-query.ts` (`/auth/me`: live permissions loaded in `_app` `beforeLoad`, observed by `AppShell`, refreshes the stored session; invalidated by role updates), `query-keys.ts` (`rootKeys` + `useInvalidate`), `query-client.ts` (global error toast for queries and mutations, 401 skipped), `toast.ts` (toast store; `components/Toast` renders it), `format.ts` (money and dates — instants in the store zone, date-only values as `YYYY-MM-DD` with no zone shift). `lib/` imports neither `components/` nor `features/`.
- `src/components/` — flat shared UI components (`Button`, `Modal`, `Table`, `Screen`, …). Styling is Tailwind 4 plus hand-authored `s-*` classes in `styles.css`; icons from `lucide-react`.

The PDV's in-progress sale protocol lives in `features/sale/useSaleFlow.ts` (operations queued, pending quantities committed before any other operation); hotkeys come from the `SALE_HOTKEYS` table.

### shared package quirk

`@beverage/shared` is built as **CommonJS** (so Nest consumes `dist/`). Vite, vitest, jest and the web `tsconfig` all resolve it to the TypeScript source, so tests and the web always see live shared source. The **running API** needs `npm run build --workspace packages/shared` to pick up shared changes (`dev:api`, `db:seed*`, `db:reset` and the root `build` do it).
