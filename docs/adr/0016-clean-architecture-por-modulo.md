# 0016 — Clean Architecture com as camadas dentro de cada módulo

- **Status:** Aceito (em implementação, um PR por módulo)
- **Data:** 2026-11-23
- **Substitui em parte:** a [0014](0014-organizacao-por-funcionalidade.md) na parte do web
  (`features/<f>/api.ts`, `lib/`, `components/`). O contrato no shared e os ledgers da API
  continuam valendo.

## Contexto

O time quer o front no padrão do guia de Clean Architecture usado nos outros projetos
(`domain`, `@shared`, `data`, `infra`, `main`, `presentation`; handlers que estendem
`BaseService`; flows com controller e layout), para ter a mesma regra de dependência e os
mesmos nomes em todos eles.

A ADR 0014 tinha desmontado uma Clean Architecture anterior (ADRs 0003–0011) porque ela
separava cada funcionalidade em pastas por camada e criava uma interface, um handler, uma
factory e um teste por endpoint (512 arquivos, 52 handlers que só repassavam o HTTP). Aplicar
o guia ao pé da letra repetiria isso.

## Decisão

As camadas do guia, **agrupadas por módulo**:

```
src/
├── @shared/        contratos técnicos sem framework (IHttpClient, IKeyValueStorage)
├── domain/         o que vale para todos os módulos: erros de domínio, IPaginated
├── data/           BaseService (status HTTP + corpo de erro → erro de domínio)
├── infra/          AxiosHttpClient, BrowserLocalStorage
├── main/           composition root: makeHttpClient, query-client, query-keys
├── presentation/   components/ (UI compartilhada), flows/app-shell, utils/, hooks/
├── modules/<m>/
│   ├── domain/        models e a interface do gateway do módulo (I<M>Gateway)
│   ├── data/          <m>-handler.ts extends BaseService implements I<M>Gateway
│   ├── main/          make<M>Gateway() e as queries/mutations do TanStack Query
│   └── presentation/  flows/<tela>/{index, controller, layout, types, constants, …}
└── routes/         rotas do TanStack Router; importam só a entrada (`index.ts`) de um flow
```

Desvios do guia, para não recriar os problemas da ADR 0014:

1. **Uma interface por módulo**, não por ação. Um endpoint novo é um método no gateway e
   um `send` no handler — o mesmo lugar.
2. **Converter só onde há transformação real** (o próprio guia diz isso).
3. **Sem `withResult`/`handleActionError`.** A leitura e as ações passam pelo TanStack
   Query, que já entrega `error` à tela e tem um `onError` global com o toast
   (`main/query/query-client.ts`). Os handlers lançam erros de domínio (`NotFoundError`…),
   com o `name` que a tela usa para decidir o tratamento.
4. **Controller/layout só onde há estado.** Componente sem estado continua um `.tsx`.

A regra de dependência é verificada pelo Oxlint (`no-restricted-imports` no
`vite.config.ts` da raiz).

## Consequências

- Migração em etapas: `auth` e `settings` primeiro; depois produtos e estoque, financeiro
  e usuários, relatórios e, por último, o PDV. Até lá, `features/` e `lib/http.ts` (uma
  ponte sobre o `BaseService`) convivem com `modules/`.
- Mais arquivos por tela do que na ADR 0014 (controller, layout, types, constants), em
  troca de layouts sem estado e do mesmo padrão dos outros projetos.
