# Management System

Sistema de gestão para distribuidora de bebidas: produtos, estoque, frente de caixa (PDV) e clientes.

## Language

**Venda**:
Uma transação de PDV em andamento ou concluída, composta por itens, forma de pagamento e (opcionalmente) desconto e cliente.
_Avoid_: Pedido, transação, compra

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
Apagar o cadastro de um Produto. Ação irreversível, distinta de Remover — Produtos com venda registrada não são excluídos, apenas desativados.
_Avoid_: Remover, deletar (quando se refere ao cadastro de Produto)

**Entrada** (de estoque):
Lançamento que soma uma quantidade ao `currentStock` de um Produto, com custo e opcionalmente lote/validade. Gera um StockMovement (`ENTRY`/`PURCHASE`) e, se houver lote ou validade, um ProductBatch. Disponível tanto pela aba Estoque (busca produto) quanto embutida no formulário de Produto, na criação e na edição — ver [ADR 0001](docs/adr/0001-entrada-de-estoque-embutida-no-formulario-de-produto.md). Sempre aditiva: nunca sobrescreve o saldo.
_Avoid_: Ajuste, definir estoque (a Entrada soma; não corrige nem redefine o saldo)

**Taxa de serviço**:
Acréscimo opcional de 10% sobre o subtotal da Venda (pré-desconto), desligado por padrão no PDV (o operador liga quando cabe). Fica com a casa (não é repasse a garçom) e integra o total cobrado, o troco e o lançamento financeiro (`Sale.serviceFee`). Nos relatórios aparece separada da receita de produtos — ver [ADR 0002](docs/adr/0002-taxa-de-servico-e-detalhe-do-historico-de-vendas.md).
_Avoid_: Gorjeta, comissão (sugerem repasse a pessoa específica, que não existe no domínio)

**Cupom**:
Comprovante não-fiscal da Venda, texto de 40 colunas para impressora térmica de 80mm, gerado por `buildCupom` a partir dos dados persistidos — pode ser impresso na conclusão (PDV) ou reimpresso pelo detalhe no histórico (apenas Vendas concluídas). Não é documento fiscal (sem SEFAZ).
_Avoid_: Nota fiscal, NFC-e (documento fiscal de verdade — recurso adiado, ver docs/plans/nfce-adiado.md), recibo

**Estornar** (Venda):
Cancelar uma Venda já concluída: itens voltam ao estoque e o valor (incluindo Taxa de serviço) sai da receita e dos agregados dos relatórios. O registro é preservado para auditoria e consulta no histórico, mas Venda estornada não gera Cupom.
_Avoid_: Cancelar (reservado para abandonar a Venda em andamento, antes da conclusão — sem efeito em estoque/valores), excluir

**Ajustar** (estoque):
Corrigir o saldo de um Produto (para mais ou para menos) fora do fluxo normal de venda ou entrada — inventário, quebra, perda. Exige motivo obrigatório (auditável) e gera StockMovement (`source: ADJUSTMENT`). Só existe na aba Estoque; o formulário de Produto não tem esse fluxo.
_Avoid_: Entrada, alterar (reservados para os fluxos aditivos/sem motivo — ver Entrada e Alterar quantidade)
