/**
 * Formatos de dinheiro como a tela os mostra — importados do próprio web,
 * como `seed-data.ts` importa o seed da API. `brl` usa NBSP depois do "R$"
 * (telas); `cupomBrl`, espaço comum (texto do cupom).
 */
export { formatBRL as brl, formatBRLText as cupomBrl } from '../../../web/src/lib/format';
