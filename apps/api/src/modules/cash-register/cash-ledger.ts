import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CashMovementType,
  CashRegisterStatus,
  PaymentMethod,
  SystemCategory,
} from '@beverage/shared';

type Db = Prisma.TransactionClient;
type Decimal = Prisma.Decimal;

/**
 * Único escritor de `cash_movement` e único lugar que sabe qual é "o caixa
 * aberto". Toda entrada/saída de dinheiro do sistema passa por aqui.
 *
 * Regras:
 * - Recebimento e devolução vão para o caixa aberto *agora* (se houver).
 *   Dinheiro físico exige caixa aberto — inclusive a devolução do estorno, que
 *   nunca altera um caixa já fechado (o saldo dele foi conferido no fechamento).
 * - Sangria, suprimento e despesas pagas pela gaveta exigem caixa aberto e são
 *   sempre em dinheiro.
 * - Lançamentos fora da gaveta (conta paga, lançamento avulso) não têm caixa
 *   nem forma de pagamento.
 * - Devolução de venda (estorno) é a única saída com `saleId`; não é despesa.
 */
@Injectable()
export class CashLedger {
  /** O caixa aberto, ou null. Só pode haver um (garantido em `CashRegisterService.open`). */
  openRegister(db: Db) {
    return db.cashRegister.findFirst({
      where: { status: CashRegisterStatus.OPEN },
      orderBy: { openedAt: 'desc' },
    });
  }

  async requireOpenRegister(db: Db) {
    const register = await this.openRegister(db);
    if (!register) throw new NotFoundException('Nenhum caixa aberto');
    return register;
  }

  /** Dinheiro que entra: pagamento de venda ou recebimento de fiado. */
  async receive(
    db: Db,
    input: {
      amount: Decimal;
      paymentMethod: PaymentMethod;
      description: string;
      category: SystemCategory;
      saleId?: string;
    },
  ) {
    const register = await this.registerFor(
      db,
      input.paymentMethod,
      'Abra o caixa antes de receber em dinheiro',
    );
    const movement = await db.cashMovement.create({
      data: {
        cashRegisterId: register?.id,
        type: CashMovementType.INFLOW,
        amount: input.amount,
        description: input.description,
        paymentMethod: input.paymentMethod,
        categoryId: await this.systemCategoryId(db, input.category),
        saleId: input.saleId,
      },
    });
    return { movement, register };
  }

  /** Devolução ao cliente do valor de uma venda estornada. */
  async refundSale(
    db: Db,
    input: { amount: Decimal; paymentMethod: PaymentMethod; description: string; saleId: string },
  ) {
    const register = await this.registerFor(
      db,
      input.paymentMethod,
      'Abra o caixa para devolver o dinheiro do estorno',
    );
    return db.cashMovement.create({
      data: {
        cashRegisterId: register?.id,
        type: CashMovementType.OUTFLOW,
        amount: input.amount,
        description: input.description,
        paymentMethod: input.paymentMethod,
        saleId: input.saleId,
      },
    });
  }

  /** Sangria (PULL), suprimento (FLOAT) e despesa paga pela gaveta (OUTFLOW/INFLOW). */
  async drawer(
    db: Db,
    input: { type: CashMovementType; amount: Decimal; description: string; categoryId?: string },
  ) {
    const register = await this.requireOpenRegister(db);
    return db.cashMovement.create({
      data: {
        cashRegisterId: register.id,
        type: input.type,
        amount: input.amount,
        description: input.description,
        categoryId: input.categoryId,
        paymentMethod: PaymentMethod.CASH,
      },
    });
  }

  /** Conta paga ou lançamento avulso (FR-31/FR-35): fora da gaveta. */
  outsideDrawer(
    db: Db,
    input: {
      type: typeof CashMovementType.INFLOW | typeof CashMovementType.OUTFLOW;
      amount: Decimal;
      description: string;
      categoryId?: string | null;
      occurredAt?: Date;
    },
  ) {
    return db.cashMovement.create({
      data: {
        type: input.type,
        amount: input.amount,
        description: input.description,
        categoryId: input.categoryId,
        occurredAt: input.occurredAt,
      },
      include: { category: true },
    });
  }

  /** Despesas do período: saídas que não são devolução de venda estornada. */
  async expenses(db: Db, period: { from: Date; to: Date }) {
    const agg = await db.cashMovement.aggregate({
      where: {
        type: CashMovementType.OUTFLOW,
        saleId: null,
        occurredAt: { gte: period.from, lte: period.to },
      },
      _sum: { amount: true },
    });
    return agg._sum.amount ?? new Prisma.Decimal(0);
  }

  private async registerFor(db: Db, paymentMethod: PaymentMethod, missingMessage: string) {
    const register = await this.openRegister(db);
    if (paymentMethod === PaymentMethod.CASH && !register) {
      throw new ConflictException(missingMessage);
    }
    return register;
  }

  private async systemCategoryId(db: Db, code: SystemCategory) {
    const category = await db.financialCategory.findUnique({ where: { code } });
    if (!category) {
      throw new Error(`Categoria financeira do sistema ausente: ${code} (rode as migrações)`);
    }
    return category.id;
  }
}
