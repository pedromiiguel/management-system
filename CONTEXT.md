# Management System

Sistema de gestão para distribuidora de bebidas: produtos, estoque, frente de caixa (PDV) e clientes.

## Language

**Venda**:
Uma transação de PDV em andamento ou concluída, composta por itens, forma de pagamento e (opcionalmente) desconto e cliente. Status: `IN_PROGRESS` (em andamento), `COMPLETED` (concluída), `CANCELLED` (em andamento abandonada — ver Cancelar) e `VOIDED` (concluída e estornada — ver Estornar). `CANCELLED` e `VOIDED` são estados diferentes e nunca se confundem.
_Avoid_: Pedido, transação, compra

**Total** (`Sale.total`):
Sempre o valor devido da Venda: subtotal − desconto + Taxa de serviço (quando ligada), calculado por `priceSale` (`packages/shared/src/sale.ts`) a cada alteração — em andamento e depois de concluída. É o que se cobra, o que entra no caixa/fiado e o que se devolve no estorno.
_Avoid_: Receita (o total inclui a Taxa de serviço; a receita não)

**Receita**:
Valor dos produtos vendidos nas Vendas concluídas do período: `total − Taxa de serviço` (já com desconto). Definição única (`SalesQuery`) usada pelo painel financeiro e pelos relatórios; a Taxa de serviço aparece à parte. Vendas estornadas ou canceladas não entram.
_Avoid_: Faturamento com taxa, total (o total inclui a Taxa de serviço)

**Item**:
Uma linha da Venda — um Produto com quantidade e preço unitário no momento em que foi bipado/adicionado. Existe apenas dentro do ciclo de vida de uma Venda.
_Avoid_: Linha, produto (quando referindo-se especificamente à linha da venda, não ao cadastro)

**Bipar**:
Adicionar um Item à Venda via código de barras, SKU ou busca. Se o Produto já está na Venda, soma a quantidade em vez de criar um novo Item.
_Avoid_: Escanear, adicionar (quando se refere especificamente à entrada por código/busca — "adicionar" sozinho é ambíguo com Alterar quantidade)

**Alterar quantidade** (Item):
Mudar a quantidade de um Item que já está na Venda, direto pelo +/- ou input da coluna Qtd — sem rebipar o produto. Não tem motivo obrigatório e não afeta o cadastro do Produto.
_Avoid_: Ajustar (reservado para Ajuste de estoque, que é a correção da contagem do cadastro do Produto no módulo Estoque, com motivo obrigatório — uma ação bem diferente)

**Remover** (Item):
Tirar um Item de uma Venda em andamento, antes da finalização. Não afeta estoque nem valores — o estoque só é decrementado na conclusão da Venda. Ação de baixo custo: o Item pode ser adicionado de novo a qualquer momento.
_Avoid_: Excluir, deletar, cancelar (quando se refere a um Item — reservar esses verbos para o Produto ou para a Venda inteira)

**Excluir** (Produto):
Apagar o cadastro de um Produto. Ação irreversível, distinta de Remover — Produtos com venda registrada não são excluídos, apenas desativados. Sem venda, o cadastro sai junto com suas Entradas, Ajustes e lotes.
_Avoid_: Remover, deletar (quando se refere ao cadastro de Produto)

**Entrada** (de estoque):
Lançamento que soma uma quantidade ao `currentStock` de um Produto, com custo e opcionalmente lote/validade. Gera um StockMovement (`ENTRY`/`PURCHASE`) e, se houver lote ou validade, um ProductBatch. Disponível tanto pela aba Estoque (busca produto) quanto embutida no formulário de Produto, na criação e na edição (no formulário o custo é o preço de compra do próprio produto). Sempre aditiva: nunca sobrescreve o saldo.
_Avoid_: Ajuste, definir estoque (a Entrada soma; não corrige nem redefine o saldo)

**Taxa de serviço**:
Acréscimo opcional de 10% (`SERVICE_FEE_PERCENT`) sobre o subtotal da Venda (pré-desconto), desligado por padrão no PDV (o operador liga quando cabe). Ligar/desligar fica gravado na própria Venda (`Sale.serviceFee`; `null` = desligada) e o Total já passa a incluí-la. Fica com a casa (não é repasse a garçom) e integra o total cobrado, o troco e o lançamento financeiro. Não é Receita: no painel e nos relatórios aparece separada (`serviceFee`), e entra no resultado do mês (receita + taxa − CMV − despesas).
_Avoid_: Gorjeta, comissão (sugerem repasse a pessoa específica, que não existe no domínio)

**Cupom**:
Comprovante não-fiscal da Venda, texto de 40 colunas para impressora térmica de 80mm, gerado por `buildCupom` (`apps/web/src/features/sale/receipt.ts`) a partir dos dados persistidos — pode ser impresso na conclusão (PDV) ou reimpresso pelo detalhe no histórico (apenas Vendas concluídas). Não é documento fiscal (sem SEFAZ).
_Avoid_: Nota fiscal, NFC-e (documento fiscal de verdade — recurso adiado), recibo

**Estornar** (Venda):
Desfazer uma Venda já concluída (status `VOIDED`, "estornada"): itens voltam ao estoque (e aos mesmos lotes), o valor (incluindo Taxa de serviço) sai como devolução no fluxo de caixa — em dinheiro, pelo caixa aberto no momento — ou o fiado é desfeito, e sai da receita e dos agregados dos relatórios. O registro é preservado para auditoria e consulta no histórico, mas Venda estornada não gera Cupom.
_Avoid_: Cancelar (reservado para abandonar a Venda em andamento), excluir

**Cancelar** (Venda em andamento):
Abandonar a Venda antes da conclusão (status `CANCELLED`, "cancelada"). Nada de estoque, caixa ou financeiro foi tocado, então nada é desfeito. O PDV já abre a próxima Venda.
_Avoid_: Estornar (reservado para Venda concluída)

**Ajustar** (estoque):
Corrigir o saldo de um Produto (para mais ou para menos) fora do fluxo normal de venda ou entrada — inventário, quebra, perda. Exige motivo obrigatório (auditável) e gera StockMovement (`source: ADJUSTMENT`). Só existe na aba Estoque; o formulário de Produto não tem esse fluxo.
_Avoid_: Entrada, alterar (reservados para os fluxos aditivos/sem motivo — ver Entrada e Alterar quantidade)
