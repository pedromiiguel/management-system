import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SaleStatus } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';

const Decimal = Prisma.Decimal;
type Decimal = Prisma.Decimal;

export interface Period {
  from: Date;
  to: Date;
}

/** Receita e Taxa de serviço de um conjunto de vendas concluídas. */
export interface SalesTotals {
  revenue: Decimal;
  serviceFee: Decimal;
  count: number;
}

/**
 * Leituras de vendas concluídas usadas por painel e relatórios — um único
 * "venda concluída no período" e uma única definição de receita.
 *
 * Receita (CONTEXT.md) = valor dos produtos vendidos, já com desconto e SEM a
 * Taxa de serviço: `total − serviceFee`. A taxa é informada à parte; receita +
 * taxa = `total`, o que foi cobrado. Vendas estornadas (VOIDED) ou canceladas
 * não contam.
 */
@Injectable()
export class SalesQuery {
  constructor(private readonly prisma: PrismaService) {}

  completedIn(period: Period): Prisma.SaleWhereInput {
    return { status: SaleStatus.COMPLETED, completedAt: { gte: period.from, lte: period.to } };
  }

  async totals(period: Period): Promise<SalesTotals> {
    const agg = await this.prisma.sale.aggregate({
      where: this.completedIn(period),
      _sum: { total: true, serviceFee: true },
      _count: true,
    });
    return splitTotal(agg._sum.total, agg._sum.serviceFee, agg._count);
  }

  /** Vendas estornadas no período (pelo instante do estorno). */
  voidedCount(period: Period): Promise<number> {
    return this.prisma.sale.count({
      where: { status: SaleStatus.VOIDED, voidedAt: { gte: period.from, lte: period.to } },
    });
  }

  /** Quanto foi cobrado por forma de pagamento: `total` bruto, com a Taxa de serviço. */
  async chargedByMethod(period: Period) {
    const groups = await this.prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: this.completedIn(period),
      _sum: { total: true },
      _count: true,
    });
    return groups.map((g) => ({
      paymentMethod: g.paymentMethod,
      total: g._sum.total ?? new Decimal(0),
      count: g._count,
    }));
  }

  /** CMV com o custo congelado no item da venda (FR-33). */
  async cogs(period: Period): Promise<Decimal> {
    const items = await this.soldItems(period);
    return items.reduce((acc, i) => acc.add(i.unitCost.mul(i.quantity)), new Decimal(0));
  }

  /**
   * Vendas concluídas no período somadas por uma chave do instante de
   * conclusão (ex.: dia ou mês da loja), na ordem cronológica.
   */
  async totalsBy(
    period: Period,
    keyOf: (completedAt: Date) => string,
  ): Promise<(SalesTotals & { key: string })[]> {
    const sales = await this.prisma.sale.findMany({
      where: this.completedIn(period),
      select: { completedAt: true, total: true, serviceFee: true },
      orderBy: { completedAt: 'asc' },
    });
    const groups = new Map<string, SalesTotals & { key: string }>();
    for (const sale of sales) {
      const key = keyOf(sale.completedAt!);
      const fee = sale.serviceFee ?? new Decimal(0);
      const entry = groups.get(key) ?? { key, ...splitTotal(null, null, 0) };
      entry.revenue = entry.revenue.add(sale.total.sub(fee));
      entry.serviceFee = entry.serviceFee.add(fee);
      entry.count += 1;
      groups.set(key, entry);
    }
    return [...groups.values()];
  }

  soldItems(period: Period) {
    return this.prisma.saleItem.findMany({
      where: { sale: this.completedIn(period) },
      select: {
        productId: true,
        quantity: true,
        unitPrice: true,
        unitCost: true,
        product: { select: { id: true, name: true, sku: true, unit: true } },
      },
    });
  }
}

function splitTotal(total: Decimal | null, serviceFee: Decimal | null, count: number) {
  const fee = serviceFee ?? new Decimal(0);
  return { revenue: (total ?? new Decimal(0)).sub(fee), serviceFee: fee, count };
}
