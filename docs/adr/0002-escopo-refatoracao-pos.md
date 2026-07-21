# 0002 — Escopo e abordagem da refatoração estrutural do PDV

- **Status:** Aceito
- **Data:** 2026-07-21
- **Supersede parcialmente:** [0001](0001-e2e-antes-da-refatoracao-do-front.md) (nature: deixa de ser "puramente estrutural")

## Contexto

Com a suíte E2E do PDV no ar ([0001](0001-e2e-antes-da-refatoracao-do-front.md)),
a refatoração estrutural planejada pode começar. Estado atual, verificado
nesta sessão (não apenas lembrado):

- `apps/web/src/routes/_app/pos.tsx`: 932 linhas.
- `apps/web/src/routes/_app/financial.tsx`: 850 linhas, **sem nenhum teste**
  automatizado — nem E2E (decisão deliberada em 0001) nem API (nunca escrito).
  O único spec de API do repo inteiro é `products.controller.spec.ts`.
- `flushPendingQuantity()` é chamado manualmente em 5 pontos do arquivo
  (finalizar, remover, cancelar, desconto — cobertos por
  `05-quantidade.spec.ts` — e mais um ponto de UI de item).
- `focusScan()` é chamado em **11 pontos** espalhados pelo arquivo (mais do
  que os "seis callbacks" registrados em memória de sessão anterior — o
  código cresceu desde então). Nenhum spec E2E verifica o retorno de foco.
- Não existe hoje convenção de "feature folder" no repo: `components/` tem 2
  arquivos, `lib/` é compartilhado, e toda rota grande é um único arquivo em
  `routes/_app/`.

## Decisão

1. **Escopo desta rodada: só `pos.tsx`.** `financial.tsx` fica de fora até
   existir suíte supertest cobrindo totais, taxa de serviço e fiado — não se
   refatora regra de negócio sem rede de segurança.
2. **Deixa de ser "puramente estrutural"**: esta rodada é estrutural +
   correções pontuais nos dois pontos de fragilidade conhecidos:
   - Debounce/flush de quantidade → extraído para um hook dedicado
     (`useQuantityDebounce` ou nome equivalente). Já tem cobertura forte via
     `05-quantidade.spec.ts`; qualquer regressão de comportamento é pega pela
     suíte existente sem precisar de spec novo.
   - Retorno de foco ao scanner → centralizado (11 call sites → 1 hook).
     **Decisão consciente: sem spec E2E novo para travar esse
     comportamento antes da mudança**, diferente do padrão teste-antes usado
     nos tickets 01–05. Risco aceito explicitamente porque o impacto de uma
     regressão de foco é baixo (UX, não perda de dados) — ver seção de
     riscos.
3. **Estrutura: `apps/web/src/features/pos/`** (hooks, componentes de seção,
   tipos locais). `routes/_app/pos.tsx` vira wrapper fino — só
   `createFileRoute` + import do componente de `features/pos/`, sem lógica
   própria.
4. **Sem precedente de convenção ainda**: `features/pos/` resolve o problema
   concreto do PDV agora. Não é declarado como padrão obrigatório para
   `financial.tsx`, `products.tsx`, `stock.tsx` ou `reports.tsx` — isso fica
   para uma decisão futura, tomada se e quando o padrão provar valor aqui.

## Critério de aceite

A suíte `apps/e2e/tests/*.spec.ts` completa passa sem alteração ao final da
refatoração — UI e comportamento observável idênticos, exceto pelos dois
pontos de correção pontual listados acima (que não têm teste hoje para
"idêntico" ser verificável automaticamente).

## Consequências

- Regressão em `flushPendingQuantity` é detectável automaticamente
  (`05-quantidade.spec.ts` falha).
- Regressão em foco do scanner **não é detectável automaticamente** — só por
  QA manual ou relato de uso real. Isso é uma dívida aceita, não um
  esquecimento; qualquer revisão futura deste ADR deve checar se essa lacuna
  ainda existe antes de assumir que o comportamento de foco está correto.
- `financial.tsx` continua com risco alto de mudança (850 linhas, sem teste)
  até uma rodada futura escrever supertest para ele.

## Alternativas rejeitadas

- **Incluir `financial.tsx` nesta rodada**: rejeitado — mexer em taxa de
  serviço/fiado sem nenhum teste automatizado é o tipo de risco que a suíte
  E2E de 0001 foi construída para evitar em primeiro lugar.
- **Escrever spec E2E de foco antes de centralizar `focusScan()`**:
  recomendado durante a discussão, mas rejeitado pelo dono do produto — ver
  decisão 2 acima.
- **`features/` como convenção de repo já nesta decisão**: rejeitado por
  escopo — generalizar antes de validar o padrão em um caso real seria
  decidir sem evidência.
