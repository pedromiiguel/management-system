import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ReceivableListQuery,
  ReceivableStatus,
  SettleReceivableInput,
  SystemCategory,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CashLedger } from '../cash-register/cash-ledger';

type Db = Prisma.TransactionClient;

/** Dono de `account_receivable` (fiado). */
@Injectable()
export class ReceivablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cash: CashLedger,
  ) {}

  /** FR-30: pendências por cliente. */
  list(query: ReceivableListQuery) {
    return this.prisma.accountReceivable.findMany({
      where: { customerId: query.customerId, status: query.status },
      include: {
        customer: { select: { id: true, name: true, contact: true } },
        sale: { select: { id: true, completedAt: true, total: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'asc' }],
    });
  }

  /** Saldo devedor em aberto de cada cliente. */
  async openBalances(): Promise<Map<string, Prisma.Decimal>> {
    const balances = await this.prisma.accountReceivable.groupBy({
      by: ['customerId'],
      where: { status: ReceivableStatus.OPEN },
      _sum: { amount: true },
    });
    return new Map(balances.map((b) => [b.customerId, b._sum.amount ?? new Prisma.Decimal(0)]));
  }

  /** Venda a prazo (BR-08) vira fiado em aberto. */
  createForSale(
    db: Db,
    input: { customerId: string; saleId: string; amount: Prisma.Decimal; dueDate?: Date },
  ) {
    return db.accountReceivable.create({ data: input });
  }

  /** Estorno de venda a prazo: o fiado some, desde que ainda não tenha sido recebido. */
  async cancelForSale(db: Db, saleId: string) {
    const receivable = await db.accountReceivable.findUnique({ where: { saleId } });
    if (!receivable) {
      throw new ConflictException('Venda a prazo sem fiado registrado — estorno não aplicado');
    }
    if (receivable.status === ReceivableStatus.RECEIVED) {
      throw new ConflictException(
        'O fiado desta venda já foi recebido — estorne o recebimento no financeiro antes de estornar a venda',
      );
    }
    await db.accountReceivable.delete({ where: { id: receivable.id } });
  }

  /** Baixa do fiado: marca como recebido + entrada no caixa, atomicamente (BR-08). */
  settle(id: string, input: SettleReceivableInput) {
    return this.prisma.$transaction(async (tx) => {
      const receivable = await tx.accountReceivable.findUniqueOrThrow({
        where: { id },
        include: { customer: { select: { name: true } } },
      });
      if (receivable.status === ReceivableStatus.RECEIVED) {
        throw new ConflictException('Esta conta já foi recebida');
      }
      await this.cash.receive(tx, {
        amount: receivable.amount,
        paymentMethod: input.paymentMethod,
        description: `Recebimento de fiado — ${receivable.customer.name}`,
        category: SystemCategory.RECEIVABLE_SETTLEMENT,
      });
      return tx.accountReceivable.update({
        where: { id },
        data: { status: ReceivableStatus.RECEIVED, receivedAt: new Date() },
        include: { customer: { select: { id: true, name: true } } },
      });
    });
  }
}
