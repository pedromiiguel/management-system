# Web (`@beverage/web`)

React 19 + Vite (via Vite+) + TanStack Router/Query + Tailwind 4, em **Clean Architecture com
as camadas dentro de cada módulo** ([ADR 0016](../../docs/adr/0016-clean-architecture-por-modulo.md)).
Estrutura e regra de dependência em [docs/arquitetura.md](../../docs/arquitetura.md#web-appswebsrc).

## Onde cada coisa mora

- `src/routes/` — rotas por arquivo do TanStack Router (`autoCodeSplitting`), finas: só
  `beforeLoad` e a entrada de um flow. `routeTree.gen.ts` é gerado: não edite à mão.
- `src/modules/<m>/` — `domain/` (models + `I<M>Gateway`), `data/` (`<M>Handler extends
  BaseService`), `main/` (`make<M>Gateway()`, `queryOptions`, mutations que invalidam
  **todo** recurso que o servidor altera), `presentation/flows/<tela>/` (`index.ts`,
  `controller.tsx`, `layout.tsx`, `types.ts`, `constants.ts`…).
- Global: `@shared/` (contratos técnicos), `domain/errors`, `data/base-service`, `infra/`
  (axios, localStorage), `main/` (composition root, `query-client`, `query-keys`),
  `presentation/` (`components/` de UI compartilhada, `flows/app-shell`, `utils/toast`,
  `utils/format`).
- `src/features/` e `src/lib/http.ts` — organização anterior (ADR 0014), em migração para
  `modules/`. Não crie arquivo novo lá: ao mexer numa funcionalidade ainda em `features/`,
  siga o padrão dela ou migre o módulo inteiro.

## Um endpoint novo

1. Método no `I<M>Gateway` (`modules/<m>/domain/`).
2. Implementação no `<M>Handler` com `this.send<T>({ url, method })`.
3. `queryOptions` ou mutation em `modules/<m>/main/`, com `useInvalidate(...)` de tudo o
   que o efeito no servidor atinge.
4. O controller do flow usa a query/mutation; o layout só recebe props.

## Regras

- Respeite a regra de dependência das camadas; o Oxlint (`no-restricted-imports`, no
  `vite.config.ts` da raiz) barra o resto. De outro módulo, importe só `main/`, tipos de
  `domain/` ou a entrada de um flow.
- Erros: handlers lançam erros de domínio (`@domain/errors`); a tela decide pelo tipo
  (`error instanceof NotFoundError`), nunca pelo axios. O toast de erro é global
  (`main/query/query-client.ts`); use `meta: { toastError: false }` quando a tela mostra o
  erro.
- Controller tem o estado; layout é JSX puro (sem `useState`, `useEffect` nem query).
  Componente sem estado continua um `.tsx` simples. Sem barrels além do `index.ts` do flow.
- Convenções do guia nos módulos: named exports, interfaces `I*`, types `T*`, `useState`
  terminando em `State`, `cond ? <X /> : null` (nunca `&&`), ternário de prop vira constante.
- Formulários usam os schemas do shared via `@hookform/resolvers`. Como os schemas base não
  têm `.default()`, o formulário fornece os próprios `defaultValues`.
- Preço da venda só pelo `priceSale` do shared; nada de float.

## PDV

O protocolo da venda em andamento mora em `features/sale/useSaleFlow.ts`: operações
enfileiradas, quantidades pendentes confirmadas antes de qualquer outra operação. Os atalhos
vêm da tabela `SALE_HOTKEYS`. Os verbos (Bipar × Alterar quantidade, Remover × Cancelar)
estão no [CONTEXT.md](../../CONTEXT.md).

Testes da web: [docs/agentes/testes.md](../../docs/agentes/testes.md).
