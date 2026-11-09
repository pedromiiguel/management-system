import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CashMovementType,
  FinancialCategoryInput,
  FinancialCategoryKind,
  ManualEntryInput,
  startOfStoreDay,
  storeCalendarStarts,
  storeDateKey,
  storeMonthKeys,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CashLedger } from '../cash-register/cash-ledger';
import { Period, SalesQuery } from '../sales/sales-query';
import { SettingsService } from '../settings/settings.service';

const Decimal = Prisma.Decimal;

/** Meses na série do painel (o atual por último). */
const MONTHLY_SERIES_LENGTH = 6;

@Injectable()
export class FinancialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cash: CashLedger,
    private readonly sales: SalesQuery,
    private readonly settings: SettingsService,
  ) {}

  /**
   * FR-29: fluxo de caixa por período. PULL/FLOAT ficam de fora — são
   * transferências internas da gaveta, não receita/despesa.
   */
  async cashFlow(period: Period) {
    const movements = await this.prisma.cashMovement.findMany({
      where: {
        type: { in: [CashMovementType.INFLOW, CashMovementType.OUTFLOW] },
        occurredAt: { gte: period.from, lte: period.to },
      },
      include: { category: true, sale: { select: { id: true } } },
      orderBy: { occurredAt: 'desc' },
    });
    const sum = (type: CashMovementType) =>
      movements
        .filter((m) => m.type === type)
        .reduce((acc, m) => acc.add(m.amount), new Decimal(0));
    const inflows = sum(CashMovementType.INFLOW);
    const outflows = sum(CashMovementType.OUTFLOW);
    return { movements, inflows, outflows, balance: inflows.sub(outflows) };
  }

  /** FR-35: lançamento manual avulso (fora do PDV/caixa). */
  manualEntry(input: ManualEntryInput) {
    return this.cash.outsideDrawer(this.prisma, {
      type:
        input.kind === FinancialCategoryKind.INCOME
          ? CashMovementType.INFLOW
          : CashMovementType.OUTFLOW,
      amount: new Decimal(input.amount),
      description: input.description,
      categoryId: input.categoryId,
      occurredAt: input.date,
    });
  }

  listCategories() {
    return this.prisma.financialCategory.findMany({
      where: { active: true },
      orderBy: [{ kind: 'asc' }, { name: 'asc' }],
    });
  }

  createCategory(input: FinancialCategoryInput) {
    return this.prisma.financialCategory.create({ data: input });
  }

  /**
   * FR-32/33/34/36 — receita do dia/mês/ano-calendário da loja (BR-01/BR-02),
   * resultado do mês, cobrado por forma de pagamento e a série dos últimos
   * meses da loja. Receita segue a definição única de `SalesQuery` (sem Taxa
   * de serviço); a taxa vem à parte e entra no resultado — fica com a casa.
   */
  async dashboard() {
    const now = new Date();
    const starts = storeCalendarStarts(now);
    const month = { from: starts.month, to: now };
    const monthKeys = storeMonthKeys(now, MONTHLY_SERIES_LENGTH);
    const seriesPeriod = { from: startOfStoreDay(`${monthKeys[0]}-01`), to: now };

    const [day, monthTotals, year, byMethod, cogs, expenses, byMonth, target] = await Promise.all([
      this.sales.totals({ from: starts.day, to: now }),
      this.sales.totals(month),
      this.sales.totals({ from: starts.year, to: now }),
      this.sales.chargedByMethod(month),
      this.sales.cogs(month),
      this.cash.expenses(this.prisma, month),
      this.sales.totalsBy(seriesPeriod, (at) => storeDateKey(at).slice(0, 7)),
      this.settings.get('revenueTargetMonthly'),
    ]);
    const { revenue, serviceFee } = monthTotals;

    return {
      revenue: { day: day.revenue, month: revenue, year: year.revenue },
      serviceFee: { day: day.serviceFee, month: serviceFee, year: year.serviceFee },
      /** Valor cobrado (com Taxa de serviço) por forma de pagamento no mês. */
      byMethodMonth: byMethod,
      monthly: monthKeys.map((key) => {
        const totals = byMonth.find((m) => m.key === key);
        return {
          month: key,
          revenue: totals?.revenue ?? new Decimal(0),
          serviceFee: totals?.serviceFee ?? new Decimal(0),
        };
      }),
      result: {
        revenue,
        serviceFee,
        cogs,
        expenses,
        profit: revenue.add(serviceFee).sub(cogs).sub(expenses),
      },
      target: {
        monthly: target,
        progress: target === null ? null : revenue.div(target).toDecimalPlaces(4),
      },
    };
  }
}
