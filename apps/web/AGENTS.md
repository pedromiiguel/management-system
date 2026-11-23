# Web (`@beverage/web`)

React 19 + Vite (via Vite+) + TanStack Router/Query + Tailwind 4, organizada **por funcionalidade**
([ADR 0014](../../docs/adr/0014-organizacao-por-funcionalidade.md)). Visão geral e regras
de dependência em [docs/arquitetura.md](../../docs/arquitetura.md#web-appswebsrc).

## Onde cada coisa mora

- `src/routes/` — rotas por arquivo do TanStack Router (`autoCodeSplitting`), finas.
  `routeTree.gen.ts` é gerado: não edite à mão. `_app/` exige sessão no `beforeLoad` e
  renderiza o `AppShell`.
- `src/features/<f>/` — tudo o que muda junto: `api.ts` (funções HTTP tipadas,
  `queryOptions`, mutations que invalidam **todo** recurso que o servidor altera),
  páginas e componentes `.tsx`, lógica pura com teste ao lado (`vp test`, importando de
  `vite-plus/test`).
- `src/lib/` — infraestrutura: `http` (axios, JWT, erros viram `ApiError`, logout no
  401), `session` (`useSession`, `hasPermission`, `startSession`, `logout` — a única
  saída, também limpa o cache), `session-query` (`/auth/me`, permissões vivas),
  `query-keys` (`rootKeys` + `useInvalidate`), `query-client` (toast global de erro,
  ignora 401), `toast`, `format` (dinheiro; instantes no fuso da loja; datas sem hora
  como `YYYY-MM-DD`, sem conversão de fuso). `lib/` não importa `components/` nem
  `features/`.
- `src/components/` — UI compartilhada, numa pasta plana (`Button`, `Modal`, `Table`,
  `Screen`…). Estilo: Tailwind 4 + classes `s-*` escritas à mão em `styles.css`; ícones
  do `lucide-react`.

## Regras

- Entre funcionalidades, importe só o `api.ts` e os componentes de entrada listados em
  [docs/arquitetura.md](../../docs/arquitetura.md#dependências). O Oxlint
  (`no-restricted-imports`, no `vite.config.ts` da raiz) barra o resto.
- Tipos de resposta ficam no `api.ts` de cada funcionalidade; o shared exporta só tipos
  de entrada, `AppSettings` e enums.
- Formulários usam os schemas do shared via `@hookform/resolvers`. Como os schemas base
  não têm `.default()`, o formulário fornece os próprios `defaultValues`.
- Preço da venda só pelo `priceSale` do shared; nada de float.

## PDV

O protocolo da venda em andamento mora em `features/sale/useSaleFlow.ts`: operações
enfileiradas, quantidades pendentes confirmadas antes de qualquer outra operação. Os
atalhos vêm da tabela `SALE_HOTKEYS`. Os verbos (Bipar × Alterar quantidade, Remover ×
Cancelar) estão no [CONTEXT.md](../../CONTEXT.md).

Testes da web: [docs/agentes/testes.md](../../docs/agentes/testes.md).
