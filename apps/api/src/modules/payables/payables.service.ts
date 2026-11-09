import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CashMovementType, PayableInput, PayableStatus } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { CashLedger } from '../cash-register/cash-ledger';

@Injectable()
export class PayablesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cash: CashLedger,
  ) {}

  list(status: PayableStatus) {
    return this.prisma.accountPayable.findMany({
      where: { status },
      include: { category: true },
      orderBy: [{ dueDate: 'asc' }],
    });
  }

  create(input: PayableInput) {
    return this.prisma.accountPayable.create({
      data: { ...input, amount: new Prisma.Decimal(input.amount) },
      include: { category: true },
    });
  }

  /** FR-31: baixa por pagamento — saída no fluxo de caixa, atomicamente. */
  pay(id: string) {
    return this.prisma.$transaction(async (tx) => {
      const payable = await tx.accountPayable.findUniqueOrThrow({ where: { id } });
      if (payable.status === PayableStatus.PAID) {
        throw new ConflictException('Esta conta já foi paga');
      }
      await this.cash.outsideDrawer(tx, {
        type: CashMovementType.OUTFLOW,
        amount: payable.amount,
        description: `Pagamento — ${payable.description}${payable.supplier ? ` (${payable.supplier})` : ''}`,
        categoryId: payable.categoryId,
      });
      return tx.accountPayable.update({
        where: { id },
        data: { status: PayableStatus.PAID, paidAt: new Date() },
        include: { category: true },
      });
    });
  }
}
