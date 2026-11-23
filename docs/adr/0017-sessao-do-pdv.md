# 0017 — Sessão do PDV: a Venda em andamento num módulo de domínio

- **Status:** Aceito
- **Data:** 2026-11-23
- **Complementa:** a [0016](0016-clean-architecture-por-modulo.md)

## Contexto

Uma revisão de arquitetura (skill `improve-codebase-architecture`) achou o ciclo da Venda em
andamento espalhado em três lugares: a fila (`sale-queue.ts`, testada), o hook
`use-sale-flow.ts` (cancelar e reabrir, F10 repetido, "não encontrado", invalidação; sem
teste) e as regras de conclusão dentro do controller React (`prepareCompletion`, com
`paid >= total` em float). O gateway era criado dentro do hook, então nenhum teste podia
trocá-lo. E o PDV mostrava formas de pagamento desligadas nas Configurações: a venda só era
recusada pela API, no F10.

## Decisão

- `modules/sale/domain/sale-session.ts` (TypeScript puro) concentra a Venda, a fila, o
  checkout (forma de pagamento, valor recebido, cliente, nota) e as regras de conclusão:
  itens, forma ligada nas Configurações, dinheiro que cubra o Total (em centavos, pelo
  `priceSale`) e cliente no fiado. A conclusão devolve o motivo do bloqueio; a tela decide
  como avisar.
- A sessão recebe o gateway (`Pick` do `ISaleGateway`, sem interface nova) e uma porta de
  eventos `{ warn, error, settled, completed }`. Toast, foco e invalidação do cache ficam no
  adapter React `use-sale-session.ts` (`useSyncExternalStore`).
- Dois adapters no seam do gateway: `SaleHandler` em produção e `FakeSaleGateway` (em
  memória, com o Total pelo `priceSale`) nos testes da sessão.
- O PDV esconde as formas desligadas; se a escolhida for desligada, volta para a primeira
  ligada.

## Consequências

- Regra nova da Venda em andamento vai na sessão, com teste sobre o fake, sem React nem e2e.
- O controller do PDV fica só com modais, foco, atalhos, texto dos campos e seleção.
- A lista do que invalidar ao concluir continua em `SALE_SETTLEMENT_EFFECTS`; juntar os
  efeitos de todas as operações numa tabela só é outro passo.
