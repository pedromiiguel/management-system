import {
  DiscountType,
  PAYMENT_METHOD_LABELS,
  saleCode,
  SERVICE_FEE_PERCENT,
  STORE_TIME_ZONE,
} from '@beverage/shared';
import { formatBRLText as brl, formatDecimal } from '@/lib/format';
import type { Sale } from './api';
import { salePricing } from './sale';

/**
 * Cupom não-fiscal (FR-23): texto puro de 40 colunas para impressora térmica
 * de 80mm. O preview na tela é exatamente o que a impressora recebe.
 */

const WIDTH = 40;

// Larguras das colunas de itens (somadas aos 5 espaços separadores = 40).
const COL = { num: 2, code: 5, desc: 10, qty: 3, unit: 7, total: 8 } as const;

function center(text: string, width = WIDTH): string {
  if (text.length >= width) return text;
  return ' '.repeat(Math.floor((width - text.length) / 2)) + text;
}

/** Corta com reticências quando não cabe na coluna. */
function fit(text: string, width: number): string {
  if (text.length <= width) return text.padEnd(width);
  return `${text.slice(0, width - 1)}…`;
}

/** Linha "LABEL ........ valor" com o valor alinhado à direita. */
function kv(label: string, value: string): string {
  return label + value.padStart(Math.max(WIDTH - label.length, value.length + 1));
}

type Cells = [string, string, string, string, string, string];

function headerRow([num, code, desc, qty, unit, total]: Cells): string {
  return [
    num.padEnd(COL.num),
    fit(code, COL.code),
    fit(desc, COL.desc),
    qty.padStart(COL.qty),
    unit.padStart(COL.unit),
    total.padStart(COL.total),
  ].join(' ');
}

// Espaço antes da descrição na 1ª linha do item (# + CÓD. + separadores).
const DESC_PREFIX = COL.num + 1 + COL.code + 1;

/**
 * Item em duas linhas: a descrição ocupa a 1ª linha inteira e os números
 * ficam na 2ª, alinhados às colunas UN/VL.UNIT/VL.TOTAL do cabeçalho.
 */
function itemRows([num, code, desc, qty, unit, total]: Cells): string[] {
  return [
    [num.padEnd(COL.num), fit(code, COL.code), fit(desc, WIDTH - DESC_PREFIX)].join(' ').trimEnd(),
    [
      ' '.repeat(DESC_PREFIX + COL.desc),
      qty.padStart(COL.qty),
      unit.padStart(COL.unit),
      total.padStart(COL.total),
    ].join(' '),
  ];
}

/** "12345678000190" → "12.345.678/0001-90" (se já vier pontuado, mantém). */
function formatCnpj(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 14) return raw;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

/** Estabelecimento impresso no cabeçalho; sem CNPJ, a linha é omitida. */
export const STORE: { name: string; cnpj?: string } = {
  name: 'COSTAS BAR',
  cnpj: '67.968.751/0001-77',
};

export function buildCupom(sale: Sale): string {
  const emittedAt = new Date(sale.completedAt ?? Date.now()).toLocaleString('pt-BR', {
    timeZone: STORE_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const lines: string[] = [center(STORE.name.toUpperCase())];
  if (STORE.cnpj) lines.push(center(`CNPJ ${formatCnpj(STORE.cnpj)}`));
  lines.push(
    center(`Venda #${saleCode(sale.id)} - ${emittedAt}`),
    '='.repeat(WIDTH),
    headerRow(['#', 'CÓD.', 'DESCRIÇÃO', 'UN', 'VL.UNIT', 'VL.TOTAL']),
    '-'.repeat(WIDTH),
  );

  sale.items.forEach((item, index) => {
    lines.push(
      ...itemRows([
        String(index + 1),
        // Primeiros dígitos do código de barras; sem EAN, o SKU.
        (item.product.ean ?? item.product.sku).slice(0, COL.code),
        item.product.name,
        String(item.quantity),
        formatDecimal(item.unitPrice),
        formatDecimal(item.unitPrice * item.quantity),
      ]),
    );
  });

  lines.push('-'.repeat(WIDTH), kv('SUBTOTAL', brl(sale.subtotal)));

  const { discount } = salePricing(sale);
  if (discount > 0) {
    const label =
      sale.discountType === DiscountType.PERCENT ? `DESCONTO (${sale.discountValue}%)` : 'DESCONTO';
    lines.push(kv(label, `-${brl(discount)}`));
  }

  // Sem acento: a impressora térmica pode não ter "Ç" na tabela de caracteres padrão.
  if (sale.serviceFee) {
    lines.push(kv(`TAXA DE SERVICO (${SERVICE_FEE_PERCENT}%)`, brl(sale.serviceFee)));
  }

  lines.push(kv('TOTAL GERAL', brl(sale.total)), '-'.repeat(WIDTH));

  if (sale.paymentMethod) {
    lines.push(`PAGAMENTO: ${PAYMENT_METHOD_LABELS[sale.paymentMethod].toUpperCase()}`);
  }
  if (sale.amountPaid !== null) lines.push(kv('RECEBIDO', brl(sale.amountPaid)));
  if (sale.change !== null) lines.push(kv('TROCO', brl(sale.change)));
  if (sale.customer) lines.push(kv('CLIENTE', sale.customer.name.slice(0, 24)));

  lines.push('='.repeat(WIDTH), center('Obrigado pela preferência!'));

  return lines.join('\n');
}
