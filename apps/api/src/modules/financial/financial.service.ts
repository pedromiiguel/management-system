import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CashMovementType,
  FinancialCategoryInput,
  FinancialCategoryKind,
  ManualEntryInput,
  storeCalendarStarts,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CashLedger } from '../cash-register/cash-ledger';
import { Period, SalesQuery } from '../sales/sales-query';
import { SettingsService } from '../settings/settings.service';

const Decimal = Prisma.Decimal;

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
   * resultado do mês e consolidação por forma de pagamento. Receita segue a
   * definição única de `SalesQuery` (sem Taxa de serviço — Receita no CONTEXT.md).
   */
  async dashboard() {
    const now = new Date();
    const starts = storeCalendarStarts(now);
    const month = { from: starts.month, to: now };

    const [revenueDay, revenueMonth, revenueYear, byMethod, cogsMonth, expensesMonth, target] =
      await Promise.all([
        this.sales.revenue({ from: starts.day, to: now }),
        this.sales.revenue(month),
        this.sales.revenue({ from: starts.year, to: now }),
        this.sales.revenueByMethod(month),
        this.sales.cogs(month),
        this.cash.expenses(this.prisma, month),
        this.settings.get('revenueTargetMonthly'),
      ]);

    return {
      revenue: { day: revenueDay, month: revenueMonth, year: revenueYear },
      byMethodMonth: byMethod,
      result: {
        revenue: revenueMonth,
        cogs: cogsMonth,
        expenses: expensesMonth,
        profit: revenueMonth.sub(cogsMonth).sub(expensesMonth),
      },
      target: {
        monthly: target,
        progress: target === null ? null : revenueMonth.div(target).toDecimalPlaces(4),
      },
    };
  }
}
