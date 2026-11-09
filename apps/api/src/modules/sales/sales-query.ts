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

/**
 * Leituras de vendas concluídas usadas por painel e relatórios — um único
 * "venda concluída no período" e uma única definição de receita.
 *
 * Receita (CONTEXT.md) = valor dos produtos vendidos, já com desconto e SEM a
 * Taxa de serviço: `total − serviceFee`. A taxa é informada à parte. Vendas
 * estornadas (VOIDED) ou canceladas não contam.
 */
@Injectable()
export class SalesQuery {
  constructor(private readonly prisma: PrismaService) {}

  completedIn(period: Period): Prisma.SaleWhereInput {
    return { status: SaleStatus.COMPLETED, completedAt: { gte: period.from, lte: period.to } };
  }

  async revenue(period: Period): Promise<Decimal> {
    const agg = await this.prisma.sale.aggregate({
      where: this.completedIn(period),
      _sum: { total: true, serviceFee: true },
    });
    return saleRevenue({
      total: agg._sum.total ?? new Decimal(0),
      serviceFee: agg._sum.serviceFee,
    });
  }

  async revenueByMethod(period: Period) {
    const groups = await this.prisma.sale.groupBy({
      by: ['paymentMethod'],
      where: this.completedIn(period),
      _sum: { total: true, serviceFee: true },
      _count: true,
    });
    return groups.map((g) => ({
      paymentMethod: g.paymentMethod,
      total: saleRevenue({ total: g._sum.total ?? new Decimal(0), serviceFee: g._sum.serviceFee }),
      count: g._count,
    }));
  }

  /** CMV com o custo congelado no item da venda (FR-33). */
  async cogs(period: Period): Promise<Decimal> {
    const items = await this.soldItems(period);
    return items.reduce((acc, i) => acc.add(i.unitCost.mul(i.quantity)), new Decimal(0));
  }

  completedSales(period: Period) {
    return this.prisma.sale.findMany({
      where: this.completedIn(period),
      select: { id: true, completedAt: true, total: true, serviceFee: true, paymentMethod: true },
      orderBy: { completedAt: 'asc' },
    });
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

/** Receita de uma venda (ou de uma soma de vendas): total sem a Taxa de serviço. */
export function saleRevenue(sale: { total: Decimal; serviceFee: Decimal | null }): Decimal {
  return sale.total.sub(sale.serviceFee ?? 0);
}
