import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CustomerInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { ReceivablesService } from '../receivables/receivables.service';

@Injectable()
export class CustomersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly receivables: ReceivablesService,
  ) {}

  /** Inclui saldo devedor em aberto por cliente (FR-30). */
  async list(search?: string) {
    const [customers, balances] = await Promise.all([
      this.prisma.customer.findMany({
        where: {
          active: true,
          ...(search ? { name: { contains: search, mode: 'insensitive' } } : {}),
        },
        orderBy: { name: 'asc' },
      }),
      this.receivables.openBalances(),
    ]);
    return customers.map((c) => ({
      ...c,
      openBalance: balances.get(c.id) ?? new Prisma.Decimal(0),
    }));
  }

  create(input: CustomerInput) {
    return this.prisma.customer.create({ data: input });
  }
}
