# AGENTS.md

Sistema de gestão do Costa's Espetos (bar / distribuidora de bebidas): catálogo de
produtos, estoque, frente de caixa (PDV), clientes e fiado, caixa e financeiro.
Monorepo com npm **workspaces** (não pnpm/turbo/nx), Node >= 22.

```
packages/shared   @beverage/shared — contrato: schemas Zod, enums, permissões, priceSale, dia da loja
apps/api          @beverage/api — NestJS 11 + Prisma 6 + PostgreSQL 17
apps/web          @beverage/web — React 19 + Vite + TanStack Router/Query + Tailwind 4
apps/e2e          @beverage/e2e — Playwright (Chromium) contra web + api
```

## Regras que valem sempre

- Domínio, UI e mensagens em **português (pt-BR)**. Os códigos FR-/NFR-/BR- nos
  comentários são os requisitos da especificação.
- **Antes de mexer em venda, estoque ou financeiro, leia o [CONTEXT.md](CONTEXT.md).**
  Os verbos do domínio não são sinônimos (Remover × Excluir × Cancelar × Estornar,
  Entrada × Ajustar, Total × Receita). Usar o termo errado no código ou na UI é bug.
- Autorização é por **permissão**, não por papel: o catálogo fica no shared e toda
  rota nova declara `@RequirePermission`.
- Dinheiro nunca em float: `Decimal` na API e `priceSale` (centavos inteiros) no shared.
- Validação só pelos schemas Zod do shared, usados pela API e pelos formulários.
- **Nunca rode as suítes e2e (`test:e2e:api`, `test:e2e`) contra o banco da loja**:
  elas apagam o banco do `DATABASE_URL`.

## Comandos (da raiz)

`npm run dev` · `npm test` · `npm run lint` · `npm run typecheck` · `npm run format` ·
`npm run build`. O que foge do padrão:

- O shared compila para CommonJS. A **API em execução** só enxerga mudanças no shared
  depois de `npm run build --workspace packages/shared` (`dev:api`, `db:*` e `build`
  já fazem isso). Testes e web leem o código-fonte direto.
- `npm run typecheck` precisa do `routeTree.gen.ts` da web: rode o build ou o dev da
  web antes.
- Banco local: `docker compose up -d postgres`; `.env` a partir de
  `apps/api/.env.example`. `db:seed` (base) · `db:seed:fixtures` (com dados de
  exemplo) · `db:reset` (zera e semeia com fixtures).

## Quando for…

- **mexer na API** → [apps/api/AGENTS.md](apps/api/AGENTS.md)
- **mexer na web** → [apps/web/AGENTS.md](apps/web/AGENTS.md)
- **entender a estrutura ou criar uma funcionalidade** → [docs/arquitetura.md](docs/arquitetura.md)
  (por quê: [docs/adr/](docs/adr/))
- **escrever ou rodar testes** → [docs/agentes/testes.md](docs/agentes/testes.md)
- **commitar, abrir PR ou mexer em CI/deploy** → [docs/agentes/entrega.md](docs/agentes/entrega.md)
- **criar uma migration Prisma** → skill `nova-migration-prisma`
- **adicionar uma permissão** → skill `nova-permissao`
- **rodar e2e ou `db:reset`** → skill `rodar-e2e`

## Como manter estes arquivos

Este arquivo vai em toda conversa com o agente: mantenha curto. Regra de um assunto
vai no doc ou no `AGENTS.md` do app correspondente; tarefa pontual e repetível vira
skill em `.claude/skills/`. Acrescente uma regra quando o agente errar de fato, não por
precaução, e evite citar caminhos de arquivo que mudam com frequência. `CLAUDE.md`
só importa o `AGENTS.md` (`@AGENTS.md`): edite sempre o `AGENTS.md`.
