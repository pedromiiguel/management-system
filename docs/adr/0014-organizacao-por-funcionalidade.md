# 0014 — Web organizado por funcionalidade; contrato e precificação no shared

- **Status:** Aceito (implementado)
- **Data:** 2026-11-09
- **Substitui:** as ADRs [0003](0003-clean-architecture-piloto-pos.md) a [0011](0011-clean-architecture-auth.md) — incluindo a [0005](0005-centraliza-tipos-em-domain.md) (tipos em `domain/models`) — e os documentos `docs/arquiteture.md` e `docs/componentes-mvvm.md`. Substitui em parte a [0012](0012-migracao-sol-lucide.md) (a estrutura MVVM de `presentation/components/`; os ícones `lucide-react` continuam).

## Contexto

Uma auditoria de acoplamento ("as peças que mudam juntas moram juntas?") do
`apps/web` em Clean Architecture + MVVM encontrou:

- Um endpoint novo exigia de 6 a 8 arquivos em 7 pastas (usecase, endpoint,
  handler, teste do handler, factory, query/mutation, model, presentation).
  "Excluir produto" era 1 arquivo antes da migração; cada commit da migração
  tocou de 45 a 105 arquivos.
- 50 dos 52 handlers só chamavam o HTTP e devolviam o corpo; 52 interfaces
  `I*` com uma única implementação; 52 factories de uma linha; 29 de 40
  rotas de API usadas uma única vez. Os 52 testes de handler só repetiam a URL.
- 17 ViewModels só repassavam props; 66 `index.ts` de uma linha, 62
  `.types.ts`, 55 `.view.tsx`.
- 35 tipos de resposta escritos à mão em `domain/models`, redeclarando enums
  do shared; 3 schemas locais já divergiam do shared.
- Chaves de cache como strings soltas em 12 models; concluir venda não
  invalidava estoque, caixa nem relatórios.
- Regras do domínio espalhadas: preço da venda calculado no servidor
  (Decimal) e no web (float); código curto da venda em 8 lugares; rótulo
  "10%" fixo em 4.

## Decisão

1. **Web por funcionalidade.** `src/features/<f>/` reúne o que muda junto:
   `api.ts` (funções HTTP tipadas, `queryOptions`, hooks de mutation que
   invalidam tudo o que o efeito no servidor atinge), páginas e componentes
   como `.tsx` simples, lógica pura com teste ao lado. `src/lib/` tem um só
   `http`/`session`/`query-keys`; `src/components/` é uma pasta plana de
   componentes de UI. Sem interfaces de implementação única, factories,
   ViewModels de repasse nem barrels.
2. **Contrato no shared.** Schemas Zod (corpo e query), enums com rótulos
   (`SALE_STATUS_LABELS`, `PAYMENT_METHOD_LABELS`…), as configurações
   (`parseSetting`, `DEFAULT_SETTINGS`), `priceSale`, `saleCode` e `SERVICE_FEE_LABEL` têm uma
   fonte só, usada pela API e pelo web.
3. **API com donos de agregado.** `StockLedger` e `CashLedger` são os únicos
   escritores das tabelas de estoque e caixa; `SalesQuery` é a única definição
   de "venda concluída no período" e de Receita.

## Consequências

- `apps/web/src` passou de 512 para cerca de 85 arquivos. Um endpoint novo
  é uma função no `api.ts` da funcionalidade e, se preciso, um hook.
- Tipos de resposta ficam no `api.ts` de cada funcionalidade (o shared só
  exporta tipos de entrada, `AppSettings` e enums) — ponto a revisitar se
  divergirem da API.
- Formulários fornecem seus `defaultValues`: os schemas base não têm
  `.default()` (só os de criação).
- As ADRs substituídas ficam como histórico; a estrutura atual está em
  [docs/arquitetura.md](../arquitetura.md).
