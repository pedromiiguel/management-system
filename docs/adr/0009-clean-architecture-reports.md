# 0009 — Reports como 5º módulo da Clean Architecture

- **Status:** Aceito (implementado)
- **Data:** 2026-07-24
- **Estende:** o padrão promovido a convenção de repo pela [ADR 0006](0006-clean-architecture-financial-promove-convencao.md), aplicando a mesma receita de migração de tipos do [ADR 0005](0005-centraliza-tipos-em-domain.md) e a convenção de componentes do [componentes-mvvm.md](../componentes-mvvm.md)
- **Resolve parcialmente:** a promessa registrada na ADR 0006 ("quando `reports.tsx` for migrado, [`IGetSalesTotal`] deve se mover para lá")

## Contexto

Depois de `sale` (ADR 0003), `financial` (ADR 0006), `products` (ADR 0007) e
`stock` (ADR 0008), restavam `reports.tsx` (400 linhas) e `settings.tsx`
(458). Grilling manual (mesma situação das quatro rodadas anteriores —
skills `/grilling`/`/domain-modeling` referenciados por `grill-with-docs`
não instalados nesta máquina; decisões tomadas em diálogo direto via
`AskUserQuestion`) escolheu `reports.tsx` nesta rodada.

`reports.tsx` tem 4 abas (`SSeg`, mesmo padrão do `financial`): Vendas por
período, Mais vendidos, Margem por produto, Posição de estoque. Diferente
dos módulos anteriores, ele não é só leitura agregada — carrega um histórico
de vendas paginado com **ação de estorno** (`voidSale`, BR-05) e um modal de
detalhe de venda que reimprime cupom.

Inspeção (não suposição — ver [[feedback-verify-test-coverage-claims]])
confirmou:

- **Nenhuma cobertura de teste** para `reports`: sem spec em
  `apps/api/test/`, sem spec em `apps/e2e/tests/`. As 3 rotas de leitura
  (`salesByPeriod`, `productPerformance`, `stockPosition`, todas em
  `reports.controller.ts`) são agregação aritmética sem ramificação real —
  `salesByPeriod` só soma/agrupa por dia; `stockPosition` delega para
  `StockService.position()`, já sem teste dedicado próprio mas também sem
  ramificação.
- `POST /sales/:id/void` (`sales.service.ts:279`, BR-05: estorna venda
  concluída — devolve estoque, reverte financeiro, guarda contra reestorno e
  contra fiado já recebido) **também não tem nenhum teste**, apesar de já
  existir na API antes desta rodada. É a única regra de negócio real com
  ramificação alcançável a partir de `reports.tsx`.
- `GET /sales/history` (`sales.controller.ts:28`, permissão `SALES_HISTORY`
  — distinta de `REPORTS_READ`) e o próprio `void` (permissão `SALES_VOID`)
  vivem no controller de `sales`, não no de `reports`; nenhum dos dois está
  em `saleEndpoints` (`infra/endpoints/sale.ts`) ou nas factories do `sale`
  hoje — `reports.tsx` é o único consumidor de ambos, via `api.get`/`api.post`
  crus.
- `SaleDetailModal` (`reports.tsx:258-320`) duplica a renderização de cupom
  que já existe em `presentation/flows/sale/components/ReceiptModal`
  (mesmas classes CSS `s-receipt`/`s-cupom`).
- `exportCsv()` (`reports.tsx:83-97`) contorna `IHttpClient` com um
  `fetch()` manual (header de auth explícito, `blob()`, `createObjectURL`).
  Nenhum flow migrado tem precedente de download de arquivo — `IHttpClient`
  (`@contracts/http.ts`) e `AxiosHttpClient` assumem sempre JSON.
- `Sale`/`Paginated` já estão centralizados em `domain/models/sale.ts` /
  `domain/models/products.ts` (ADR 0005/0007); `reports.tsx` só ainda
  importa pelo caminho antigo (`lib/types.ts`, que já é reexport shim).

## Decisão

### 1. Escopo: um único flow `reports`, 4 abas locais — mesmo padrão do `financial`

`reports.tsx` vira `presentation/flows/reports/`, mantendo a tela com abas
(`SSeg`) atual — não vira 4 flows separados. As 4 abas nascem como
`components/` locais do flow (`SalesTab`, `ProductsTab` reaproveitado para
"mais vendidos"/"margem" via prop `margin`, `StockTab`), cada uma pasta MVVM
com barrel. Mesmo racional do ADR 0006 (abas compartilham rota/navegação/
contexto de tela) — não do ADR 0003 (não há um agregado único tipo `Sale`
percorrendo a tela em etapas), então **sem**
`main/factories/flows/use-reports-flow.ts`, mesmo padrão do `financial`/
`products`.

### 2. `void-sale` e `sales-history` migram para o domínio `sale`, não `reports`

Decisão tomada em diálogo com o usuário nesta rodada: os dois usecases
operam sobre o agregado `Sale` (não sobre dado agregado de relatório) e têm
permissões próprias do namespace `sales.*` (`SALES_VOID`, `SALES_HISTORY`),
distintas de `REPORTS_READ` — mesmo raciocínio que moveu `Product` de
`domain/models/sale.ts` para `domain/models/products.ts` na ADR 0007
("usecase pertence ao dono do agregado, não a quem usa primeiro").
`ICancelSale` (venda em andamento) já mora em `domain/usecases/sale`;
`IVoidSale` (venda concluída) nasce ao lado como a operação irmã. Isso
significa que, diferente do desvio do `IGetSalesTotal` na ADR 0006 (mantido
em `financial` "até esse domínio migrar"), aqui não há desvio: os dois
usecases nascem já no domínio correto porque `sale` já está migrado.

`saleEndpoints` (`infra/endpoints/sale.ts`) ganha `saleVoid(saleId)` e
`salesHistory()`; `main/factories/{queries,mutations}/sale.ts` ganham
`useSalesHistoryQuery`/`useVoidSaleMutation`, consumidos por
`presentation/flows/reports/components/SalesTab` (import cruzando de
`reports` para `sale`, mesma direção de import que `ProductsPage` já faz
para `StockEntryModal` de `stock` — padrão estabelecido, não uma exceção
nova).

### 3. `IGetSalesTotal` migra de `financial` para `reports`

Cumpre a promessa da ADR 0006 (Decisão 2, "desvio deliberado"): o usecase
que hoje mora em `domain/usecases/financial` porque `reports` ainda não
existia como domínio migra para `domain/usecases/reports`. `financial.tsx`
(`OverviewTab`, a única consumidora) troca o import para a factory nova —
uma linha, sem tocar no resto do módulo `financial`, mesmo espírito do
shim de `StockEntryModal` na ADR 0007/0008.

### 4. `SaleDetailModal` reaproveita `ReceiptModal` do `sale` em vez de duplicar

Decisão tomada em diálogo: a renderização do cupom (`<pre className="s-receipt s-cupom">`)
sai de `ReceiptModal` para um componente compartilhado,
`presentation/components/CupomReceipt/` (fora de `flows/`, ao lado dos
outros `components/` globais listados em `arquiteture.md`). `ReceiptModal`
(sale) e o novo `SaleDetailModal` (reports) consomem esse componente comum;
cada um mantém sua própria casca (`ReceiptModal` é o modal pós-checkout do
PDV; `SaleDetailModal` é o modal de consulta do histórico, com tag de
status, operador e botão de estornar que `ReceiptModal` não tem).

### 5. `IHttpClient` ganha suporte a `blob`; download de CSV passa a ser um usecase

Decisão tomada em diálogo: em vez de manter o `fetch()` cru como escape
hatch, `HttpRequest` (`@contracts/http.ts`) ganha `responseType?: 'json' |
'blob'`; `AxiosHttpClient` repassa para `axios({ responseType })`.
`HttpResponse<Blob>` é o retorno quando `responseType: 'blob'`. Três
usecases custom nascem em `domain/usecases/reports`
(`IExportSalesReportCsv`, `IExportProductPerformanceCsv`,
`IExportStockPositionCsv`) — nomes por relatório, não um genérico
`IExportReportCsv(type)`, mesmo racional de nomear por verbo de negócio do
ADR 0003 (evita um parâmetro de tipo string fazendo o papel de três
interfaces). O disparo do download no browser (`createObjectURL` + `<a>`
sintético + `revokeObjectURL`) é mecânica de DOM, então fica na
View/ViewModel de cada tab, não no handler — o handler só devolve o `Blob`.

### 6. Gate de teste do ADR 0001 — escopo restrito ao risco real

Mesmo critério restrito da ADR 0007 (não o gate total da ADR 0006): o gate
de supertest cobre só BR-05 (`void`), a única regra com ramificação real
alcançável por `reports.tsx`. A aritmética de `salesByPeriod`/
`productPerformance` fica **fora do gate** — sem branching de negócio, risco
de regressão silenciosa é baixo; ganha teste unitário de handler na fase 3
como as outras migrações (não teste de integração de pré-migração).

1. **Supertest** (`apps/api/test/reports.e2e-spec.ts`) cobrindo BR-05:
   estorno de venda à vista/PIX (reverte estoque, cria saída de caixa);
   estorno de venda fiado não recebida (reverte estoque, apaga o
   `AccountReceivable`); guarda contra estornar venda já fiado-recebida
   (`ConflictException`); guarda contra estornar venda que não está
   `COMPLETED` (`ConflictException`); guarda de permissão `SALES_VOID`.
2. **Suíte E2E** (`apps/e2e/tests/09-relatorios.spec.ts`) cobrindo os 4
   fluxos de UI **antes** de qualquer reorganização de código: troca de aba,
   filtro de período (chips hoje/7 dias/mês + inputs de data manuais),
   listagem de histórico com detalhe de venda (modal + reimpressão),
   estorno de venda pelo modal de confirmação, exportação CSV (as 3 abas
   exceto stock, que não tem filtro de período), posição de estoque com
   destaque de item abaixo do mínimo. Mesma divisão de trabalho das rodadas
   anteriores: E2E cobre integração UI↔API do caminho feliz, não a
   ramificação de BR-05 (já coberta pelo supertest).

Nenhuma camada de `domain/data/infra/main` é conectada à `presentation`
antes das duas suítes estarem verdes contra o `reports.tsx` atual.

### 7. Escopo de mudança: permite correções pontuais

Mesmo precedente das ADRs 0002/0006/0007/0008: bug revelado durante a
migração é corrigido no mesmo PR, documentado nesta ADR — não vira item
separado.

## Inventário de chamadas (10 no total: 7 de `reports`, 2 de `sale`, 1 já existente movida)

| Chamada atual                              | Entidade         | Domínio    | Usecase                            |
| -------------------------------------------- | ---------------- | ---------- | -------------------------------------- |
| `GET /reports/sales?from&to`                 | SalesReport      | `reports`  | `IGetSalesReport` *(custom)*           |
| `GET /reports/sales?...&format=csv`          | SalesReport      | `reports`  | `IExportSalesReportCsv` *(custom)*     |
| `GET /reports/products?from&to`              | ProductPerf[]    | `reports`  | `IGetProductPerformance` *(custom)*    |
| `GET /reports/products?...&format=csv`       | ProductPerf[]    | `reports`  | `IExportProductPerformanceCsv` *(custom)* |
| `GET /reports/stock-position`                | StockPositionRow[]| `reports` | `IGetStockPosition` *(custom)*         |
| `GET /reports/stock-position?format=csv`     | StockPositionRow[]| `reports` | `IExportStockPositionCsv` *(custom)*   |
| `GET /financial/dashboard` → sub-chamada     | Sale (agregado)  | `reports`  | `IGetSalesTotal` *(movida de `financial`, ADR 0006)* |
| `GET /sales/history?from&to`                 | Paginated\<Sale\> | `sale`    | `ISearchSaleHistory` *(custom)*        |
| `POST /sales/:id/void`                       | Sale             | `sale`     | `IVoidSale` *(custom)*                 |

Nomes seguem verbo de negócio, não HTTP — `IGetSalesReport` em vez de
`IGetSales` porque `sale/search-product.ts` e o catálogo de `products` já
usam variações de "search"/"get" para outras coisas; `report` no nome deixa
claro que é dado agregado, não a entidade crua.

## Faseamento (mesmo espírito das ADRs 0006-0008 — verde a cada fatia)

1. Supertest de BR-05 (`apps/api/test/reports.e2e-spec.ts`).
2. Suíte E2E dos 4 fluxos de UI contra `reports.tsx` atual.
3. `IHttpClient`/`AxiosHttpClient` ganham `responseType: 'blob'`.
4. `domain/models/reports.ts` (`SalesReport`, `ProductPerf`,
   `StockPositionRow`) + `domain/usecases/reports/*` (7 usecases, incl.
   `IGetSalesTotal` movido) + `domain/usecases/sale/{void-sale,search-sale-history}.ts`
   + `data/handlers/{reports,sale}/*` (cada um com teste unitário) +
   `infra/endpoints/reports.ts` + 2 entradas novas em `saleEndpoints` +
   `main/factories/{queries,mutations}/{reports,sale}` — código novo, morto,
   não conectado. As duas suítes da fase 1-2 não deveriam mudar de
   resultado.
5. `presentation/components/CupomReceipt/` extraído de `ReceiptModal`
   (sale) — refactor local, sem mudar comportamento observável do PDV
   (suíte E2E do PDV não deveria mudar de resultado).
6. `presentation/flows/reports/` consome as factories;
   `routes/_app/reports.tsx` vira wrapper fino; `financial.tsx` troca o
   import de `IGetSalesTotal`. As suítes de `reports`, `sale` e `financial`
   rodam de novo — ponto real de risco.

## Consequências

- Suíte supertest (`apps/api/test/reports.e2e-spec.ts`, 5 casos) cobre BR-05
  (estorno à vista/PIX reverte estoque e cria saída de caixa; estorno fiado
  não recebido apaga o `AccountReceivable`; guarda de fiado já recebido;
  guarda contra reestorno; guarda de permissão `SALES_VOID`) — 5/5 verdes.
  Rodando com `financial`/`products`/`stock`: 29/29 verdes.
- **Achado do gate, não do código novo**: bug de timezone em
  `reports.controller.ts#parsePeriod` — `end.setHours(23,59,59,999)` sobre um
  `Date` já parseado em UTC cortava o período efetivo ~3h depois da meia-noite
  UTC (fuso local UTC-3), fazendo vendas do próprio dia sumirem do relatório
  mesmo aparecendo em `/sales/history`. Corrigido no mesmo PR (mesmo
  precedente das ADRs 0002/0006/0007) construindo o fim do dia como string
  local (`${to}T23:59:59.999`), mesma técnica já usada por `/sales/history`.
- Suíte E2E (`apps/e2e/tests/09-relatorios.spec.ts`, 12 casos) cobre as 4
  abas, filtro de período (chips + inputs manuais), histórico com detalhe de
  venda, estorno pelo modal de confirmação e exportação CSV — 12/12 verdes.
  Suíte completa do projeto (todos os arquivos, incl. PDV/financeiro/
  produtos/estoque): 61/61 verdes — sem regressão nos módulos já migrados.
  `support/sale.ts` ganhou `completeKnownSale` (finaliza uma venda de
  verdade via UI, pagamento PIX) — reutilizável por rodadas futuras que
  precisem de uma venda concluída real, sem criar dado em código.
- `IHttpClient`/`AxiosHttpClient` ganharam `responseType?: 'blob'`
  (`@contracts/http.ts`, `infra/http/axios-http-client.ts`) — default
  `'json'`, não quebra nenhum consumidor existente.
- 9 usecases novos: 7 em `domain/usecases/reports` (`IGetSalesReport`,
  `IExportSalesReportCsv`, `IGetProductPerformance`,
  `IExportProductPerformanceCsv`, `IGetStockPosition`,
  `IExportStockPositionCsv`, `IGetSalesTotal` — este último movido de
  `financial`, cumprindo o desvio da ADR 0006) e 2 em `domain/usecases/sale`
  (`IVoidSale`, `ISearchSaleHistory`), cada um com handler + teste unitário —
  48/48 testes verdes em `apps/web` (suíte completa). Typecheck (`tsc
  --noEmit`) limpo.
- `presentation/components/CupomReceipt.tsx` extraído de `ReceiptModal`
  (sale) — componente global puramente apresentacional (sem Model, ver
  "Componente puramente apresentacional" em `componentes-mvvm.md`), consumido
  por `ReceiptModal` (sale) e pelo novo `SaleDetailModal` (reports).
  Verificado manualmente no browser: cupom renderiza igual em ambos os
  fluxos.
- `reports.tsx` (400 linhas, 1 arquivo) virou
  `presentation/flows/reports/` — `ReportsPage` (Model/ViewModel/View, com
  estado de aba/período/chip elevado à página, mesmo padrão do `SalePage`)
  + 3 componentes locais MVVM (`SalesTab` com `SaleDetailModal` aninhado,
  `ProductsTab` reaproveitado para "mais vendidos"/"margem" via prop
  `margin`, `StockTab`). `routes/_app/reports.tsx` é hoje um wrapper de
  6 linhas. Sem `main/factories/flows/use-reports-flow.ts` — mesmo padrão do
  `financial`/`products` (abas não compartilham um agregado único).
- `financial.tsx` (`OverviewTab.model.ts`) troca o import de
  `makeGetSalesTotal` para `@/main/factories/handlers/reports` — uma linha,
  resto do módulo intocado. `useSalesTotalQuery` (código morto, nunca
  consumido) removido de `main/factories/queries/financial.ts` no mesmo
  movimento.
- Verificado manualmente no browser: as 4 abas, filtro de período, detalhe de
  venda com reimpressão de cupom, estorno (toast + tag "cancelada" + reversão
  de estoque visível na aba Posição de estoque) e exportação CSV (via
  `IHttpClient` blob, sem o `fetch()` cru manual do código antigo) — tudo
  funcionando contra a API real. `financial.tsx` conferido à parte para
  garantir que a migração de `IGetSalesTotal` não quebrou "Faturamento mês a
  mês".
- `settings.tsx` continua fora de escopo — próximo e último candidato da
  lista de módulos legados.

## Alternativas rejeitadas

- **Manter `void-sale`/`sales-history` em `domain/usecases/reports`** (mesmo
  desvio do `IGetSalesTotal` na ADR 0006): rejeitado pelo usuário — aqui não
  há o mesmo custo que justificou o desvio original (criar um domínio do
  zero só para um usecase); `sale` já existe e é o dono conceitual correto
  do agregado.
- **Manter `SaleDetailModal` duplicando `ReceiptModal`**: rejeitado pelo
  usuário — duplicação real já encontrada (mesmas classes CSS), não
  hipotética; custo de extrair é baixo (um componente de apresentação pura).
- **Manter `exportCsv()` como escape hatch documentado, sem tocar
  `IHttpClient`**: era a recomendação inicial (YAGNI — nenhum outro flow
  precisa de blob hoje) mas rejeitada pelo usuário em favor de estender o
  contrato agora.
- **Gate de supertest cobrindo também a aritmética de `salesByPeriod`/
  `productPerformance`**: rejeitado — sem ramificação de negócio real,
  mesmo critério de escopo restrito da ADR 0007 (item "fora do gate,
  deliberadamente").
- **4 flows separados por aba**: rejeitado pelo mesmo motivo da ADR 0006
  (abas compartilham rota/navegação/contexto — separar infla estrutura sem
  separar comportamento real).
