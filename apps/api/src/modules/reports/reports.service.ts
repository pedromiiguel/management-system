import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { storeDateKey } from '@beverage/shared';
import { Period, SalesQuery } from '../sales/sales-query';

const Decimal = Prisma.Decimal;
type Decimal = Prisma.Decimal;

@Injectable()
export class ReportsService {
  constructor(private readonly sales: SalesQuery) {}

  /**
   * FR-37: vendas por período, agrupadas pelo dia da loja: receita (sem Taxa
   * de serviço — ver SalesQuery) e a taxa, à parte, por dia e no período.
   */
  async salesByPeriod(period: Period) {
    const byDay = await this.sales.totalsBy(period, storeDateKey);
    const days = byDay.map(({ key, ...totals }) => ({ day: key, ...totals }));
    return {
      days,
      count: days.reduce((acc, d) => acc + d.count, 0),
      revenue: days.reduce((acc, d) => acc.add(d.revenue), new Decimal(0)),
      serviceFee: days.reduce((acc, d) => acc.add(d.serviceFee), new Decimal(0)),
    };
  }

  /**
   * FR-38: mais vendidos. FR-39: margem por produto, com preço e custo
   * congelados no item (receita bruta do produto, antes do desconto da venda).
   */
  async productPerformance(period: Period) {
    const items = await this.sales.soldItems(period);
    const byProduct = new Map<
      string,
      {
        product: (typeof items)[number]['product'];
        revenue: Decimal;
        cost: Decimal;
        quantity: number;
      }
    >();
    for (const item of items) {
      const entry = byProduct.get(item.productId) ?? {
        product: item.product,
        revenue: new Decimal(0),
        cost: new Decimal(0),
        quantity: 0,
      };
      entry.revenue = entry.revenue.add(item.unitPrice.mul(item.quantity));
      entry.cost = entry.cost.add(item.unitCost.mul(item.quantity));
      entry.quantity += item.quantity;
      byProduct.set(item.productId, entry);
    }

    return [...byProduct.values()]
      .map((e) => ({
        product: e.product,
        quantity: e.quantity,
        revenue: e.revenue,
        cost: e.cost,
        margin: e.revenue.sub(e.cost),
        marginPercent: e.revenue.gt(0)
          ? e.revenue.sub(e.cost).div(e.revenue).mul(100).toDecimalPlaces(1)
          : new Decimal(0),
      }))
      .sort((a, b) => b.quantity - a.quantity);
  }
}
