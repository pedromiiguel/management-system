import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  CashMovementInput,
  CashMovementType,
  CashRegisterStatus,
  CloseRegisterInput,
  OpenRegisterInput,
  PaymentMethod,
} from '@beverage/shared';
import { isUniqueViolation } from '../../prisma/errors';
import { PrismaService } from '../../prisma/prisma.service';
import { CashLedger } from './cash-ledger';

const Decimal = Prisma.Decimal;
type Decimal = Prisma.Decimal;

type RegisterMovements = {
  openingBalance: Decimal;
  movements: { type: string; amount: Decimal; paymentMethod: string | null }[];
};

const withOperator = { operator: { select: { id: true, name: true } } } as const;

@Injectable()
export class CashRegisterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: CashLedger,
  ) {}

  async getCurrent() {
    const open = await this.ledger.openRegister(this.prisma);
    if (!open) return null;
    const register = await this.prisma.cashRegister.findUniqueOrThrow({
      where: { id: open.id },
      include: { ...withOperator, movements: { orderBy: { occurredAt: 'desc' } } },
    });
    return { ...register, summary: summarize(register) };
  }

  /** Um único caixa aberto — o índice único parcial barra até aberturas simultâneas. */
  async open(operatorId: string, input: OpenRegisterInput) {
    const alreadyOpen = new ConflictException('Já existe um caixa aberto — feche-o primeiro');
    if (await this.ledger.openRegister(this.prisma)) throw alreadyOpen;
    try {
      return await this.prisma.cashRegister.create({
        data: { operatorId, openingBalance: new Decimal(input.openingBalance) },
        include: withOperator,
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw alreadyOpen;
      throw error;
    }
  }

  addMovement(input: CashMovementInput) {
    return this.prisma.$transaction((tx) =>
      this.ledger.drawer(tx, { ...input, amount: new Decimal(input.amount) }),
    );
  }

  /** BR-06: confere o saldo contado contra o calculado e registra a diferença. */
  close(input: CloseRegisterInput) {
    return this.prisma.$transaction(async (tx) => {
      const open = await this.ledger.requireOpenRegister(tx);
      const register = await tx.cashRegister.findUniqueOrThrow({
        where: { id: open.id },
        include: { movements: true },
      });
      const expected = expectedCashBalance(register);
      const counted = new Decimal(input.countedBalance);
      return tx.cashRegister.update({
        where: { id: register.id },
        data: {
          status: CashRegisterStatus.CLOSED,
          closedAt: new Date(),
          expectedBalance: expected,
          countedBalance: counted,
          difference: counted.sub(expected),
          note: input.note,
        },
        include: withOperator,
      });
    });
  }

  listHistory() {
    return this.prisma.cashRegister.findMany({
      where: { status: CashRegisterStatus.CLOSED },
      orderBy: { openedAt: 'desc' },
      include: withOperator,
      take: 60,
    });
  }
}

/** Dinheiro físico na gaveta: abertura + entradas CASH − saídas CASH + suprimentos − sangrias. */
export function expectedCashBalance(register: RegisterMovements): Decimal {
  return register.movements.reduce((acc, m) => {
    if (m.type === CashMovementType.FLOAT) return acc.add(m.amount);
    if (m.type === CashMovementType.PULL) return acc.sub(m.amount);
    if (m.paymentMethod !== PaymentMethod.CASH) return acc; // PIX/cartão não entram na gaveta
    return m.type === CashMovementType.INFLOW ? acc.add(m.amount) : acc.sub(m.amount);
  }, register.openingBalance);
}

/** Resumo do turno por forma de pagamento + saldo esperado em dinheiro (FR-34). */
function summarize(register: RegisterMovements) {
  const inflowsByMethod: Record<string, Decimal> = {};
  let pulls = new Decimal(0);
  let floats = new Decimal(0);
  let outflows = new Decimal(0);
  for (const m of register.movements) {
    if (m.type === CashMovementType.INFLOW && m.paymentMethod) {
      inflowsByMethod[m.paymentMethod] = (inflowsByMethod[m.paymentMethod] ?? new Decimal(0)).add(
        m.amount,
      );
    } else if (m.type === CashMovementType.PULL) pulls = pulls.add(m.amount);
    else if (m.type === CashMovementType.FLOAT) floats = floats.add(m.amount);
    else if (m.type === CashMovementType.OUTFLOW) outflows = outflows.add(m.amount);
  }
  return { inflowsByMethod, pulls, floats, outflows, expectedCash: expectedCashBalance(register) };
}
