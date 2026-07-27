/** FR-22/BR-05: estorna venda concluída (devolve estoque, reverte financeiro). Operação irmã de `ICancelSale` (venda em andamento). */
export interface IVoidSale {
  void: (saleId: string) => Promise<void>;
}
