import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  AddSaleItemInput,
  CompleteSaleInput,
  DiscountInput,
  PaymentMethod,
  SERVICE_FEE_RATE,
  StockPolicy,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { ProductsService } from '../products/products.service';
import { SettingsService } from '../settings/settings.service';

const Decimal = Prisma.Decimal;
type Decimal = Prisma.Decimal;

const saleInclude = {
  items: {
    include: { product: { select: { name: true, sku: true, ean: true, unit: true } } },
    orderBy: { id: 'asc' as const },
  },
  customer: { select: { id: true, name: true } },
  operator: { select: { id: true, name: true } },
} satisfies Prisma.SaleInclude;

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly settings: SettingsService,
  ) {}

  /** FR-09: abre o "carrinho". Reaproveita venda em andamento do operador, se houver. */
  async open(operatorId: string) {
    const existing = await this.prisma.sale.findFirst({
      where: { operatorId, status: 'IN_PROGRESS' },
      include: saleInclude,
    });
    if (existing) return existing;
    return this.prisma.sale.create({ data: { operatorId }, include: saleInclude });
  }

  getById(id: string) {
    return this.prisma.sale.findUniqueOrThrow({ where: { id }, include: saleInclude });
  }

  /** FR-10/11/12/15: adiciona item por EAN/SKU; soma quantidade se repetido. */
  async addItem(saleId: string, input: AddSaleItemInput) {
    const sale = await this.requireInProgress(saleId);
    const product = await this.products.findByCode(input.code);
    const policy = await this.settings.get('stockPolicy');

    const existing = await this.prisma.saleItem.findUnique({
      where: { saleId_productId: { saleId: sale.id, productId: product.id } },
    });
    const newQuantity = (existing?.quantity ?? 0) + input.quantity;

    let warning: string | null = null;
    if (newQuantity > product.currentStock) {
      const message = `Estoque insuficiente de "${product.name}": disponível ${product.currentStock}, solicitado ${newQuantity}`;
      if (policy === StockPolicy.BLOCK) throw new ConflictException(message);
      warning = message;
    }

    if (existing) {
      await this.prisma.saleItem.update({
        where: { id: existing.id },
        data: { quantity: newQuantity },
      });
    } else {
      await this.prisma.saleItem.create({
        data: {
          saleId: sale.id,
          productId: product.id,
          quantity: input.quantity,
          unitPrice: product.salePrice,
          unitCost: product.purchasePrice,
        },
      });
    }
    const updated = await this.recomputeTotals(sale.id);
    return { sale: updated, warning };
  }

  /** FR-14: altera quantidade ou remove item antes da conclusão. */
  async updateItem(saleId: string, itemId: string, quantity: number) {
    await this.requireInProgress(saleId);
    const item = await this.prisma.saleItem.findFirst({ where: { id: itemId, saleId } });
    if (!item) throw new NotFoundException('Item não encontrado nesta venda');

    const policy = await this.settings.get('stockPolicy');
    const product = await this.prisma.product.findUniqueOrThrow({ where: { id: item.productId } });
    let warning: string | null = null;
    if (quantity > product.currentStock) {
      const message = `Estoque insuficiente de "${product.name}": disponível ${product.currentStock}`;
      if (policy === StockPolicy.BLOCK) throw new ConflictException(message);
      warning = message;
    }

    await this.prisma.saleItem.update({ where: { id: itemId }, data: { quantity } });
    return { sale: await this.recomputeTotals(saleId), warning };
  }

  async removeItem(saleId: string, itemId: string) {
    await this.requireInProgress(saleId);
    await this.prisma.saleItem.deleteMany({ where: { id: itemId, saleId } });
    return this.recomputeTotals(saleId);
  }

  /** FR-16: desconto em valor ou percentual. */
  async setDiscount(saleId: string, discount: DiscountInput | null) {
    await this.requireInProgress(saleId);
    await this.prisma.sale.update({
      where: { id: saleId },
      data: {
        discountType: discount?.type ?? null,
        discountValue: discount ? new Decimal(discount.value) : null,
      },
    });
    return this.recomputeTotals(saleId);
  }

  /** FR-21: cancela venda em andamento — nada de estoque/financeiro foi tocado. */
  async cancelInProgress(saleId: string) {
    await this.requireInProgress(saleId);
    return this.prisma.sale.update({
      where: { id: saleId },
      data: { status: 'CANCELLED', cancelledAt: new Date() },
      include: saleInclude,
    });
  }

  /**
   * FR-20/BR-07: conclusão ATÔMICA — baixa de estoque, venda e lançamento
   * financeiro na mesma transação; qualquer falha desfaz tudo.
   */
  async complete(saleId: string, input: CompleteSaleInput) {
    const policy = await this.settings.get('stockPolicy');
    const enabledMethods = await this.settings.get('enabledPaymentMethods');
    if (!enabledMethods.includes(input.paymentMethod)) {
      throw new BadRequestException('Forma de pagamento desabilitada nas configurações');
    }

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id: saleId },
        include: { items: { include: { product: true } } },
      });
      if (sale.status !== 'IN_PROGRESS') {
        throw new ConflictException('Venda não está em andamento');
      }
      if (sale.items.length === 0) {
        throw new BadRequestException('Venda sem itens');
      }

      // Totais (Decimal — sem float)
      const subtotal = sale.items.reduce(
        (acc, i) => acc.add(i.unitPrice.mul(i.quantity)),
        new Decimal(0),
      );
      let total = this.applyDiscount(subtotal, sale.discountType, sale.discountValue);

      // Taxa de serviço opcional do cupom: 10% sobre o subtotal (pré-desconto),
      // somada após o desconto — entra no total cobrado, no troco e no financeiro.
      let serviceFee: Decimal | null = null;
      if (input.serviceFee) {
        serviceFee = subtotal.mul(SERVICE_FEE_RATE).toDecimalPlaces(2);
        total = total.add(serviceFee);
      }

      // Troco (FR-18) — dinheiro exige valor recebido suficiente
      let amountPaid: Decimal | null = null;
      let change: Decimal | null = null;
      if (input.paymentMethod === PaymentMethod.CASH) {
        if (input.amountPaid === undefined) {
          throw new BadRequestException('Informe o valor recebido em dinheiro');
        }
        amountPaid = new Decimal(input.amountPaid);
        if (amountPaid.lt(total)) {
          throw new BadRequestException('Valor recebido é menor que o total da venda');
        }
        change = amountPaid.sub(total);
      }

      // Caixa aberto — obrigatório para dinheiro (sangria/fechamento dependem dele)
      const register = await tx.cashRegister.findFirst({
        where: { status: 'OPEN' },
        orderBy: { openedAt: 'desc' },
      });
      if (input.paymentMethod === PaymentMethod.CASH && !register) {
        throw new ConflictException('Abra o caixa antes de receber em dinheiro');
      }

      // Baixa de estoque com guarda contra corrida (BR-03)
      for (const item of sale.items) {
        if (policy === StockPolicy.BLOCK) {
          const updated = await tx.product.updateMany({
            where: { id: item.productId, currentStock: { gte: item.quantity } },
            data: { currentStock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new ConflictException(
              `Estoque insuficiente de "${item.product.name}" — venda não concluída`,
            );
          }
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { currentStock: { decrement: item.quantity } },
          });
        }
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'EXIT',
            source: 'SALE',
            quantity: item.quantity,
            saleId: sale.id,
          },
        });
        await this.consumeBatchesFefo(tx, item.productId, item.quantity);
      }

      // Lançamento financeiro (BR-08)
      if (input.paymentMethod === PaymentMethod.CREDIT) {
        await tx.accountReceivable.create({
          data: {
            customerId: input.customerId!,
            saleId: sale.id,
            amount: total,
            dueDate: input.dueDate,
          },
        });
      } else {
        const salesCategory = await tx.financialCategory.findUnique({
          where: { name: 'Vendas' },
        });
        await tx.cashMovement.create({
          data: {
            cashRegisterId: register?.id,
            type: 'INFLOW',
            amount: total,
            description: `Venda ${sale.id.slice(-6).toUpperCase()}`,
            paymentMethod: input.paymentMethod,
            categoryId: salesCategory?.id,
            saleId: sale.id,
          },
        });
      }

      return tx.sale.update({
        where: { id: sale.id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          subtotal,
          total,
          paymentMethod: input.paymentMethod,
          amountPaid,
          change,
          serviceFee,
          withInvoice: input.withInvoice,
          customerId: input.customerId,
          cashRegisterId: register?.id,
        },
        include: saleInclude,
      });
    });
  }

  /** FR-22/BR-05: cancela venda concluída com estorno de estoque e financeiro. */
  async void(saleId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id: saleId },
        include: { items: true, receivable: true },
      });
      if (sale.status !== 'COMPLETED') {
        throw new ConflictException('Apenas vendas concluídas podem ser estornadas');
      }

      if (sale.receivable) {
        if (sale.receivable.status === 'RECEIVED') {
          throw new ConflictException(
            'O fiado desta venda já foi recebido — estorne o recebimento no financeiro antes de cancelar',
          );
        }
        await tx.accountReceivable.delete({ where: { id: sale.receivable.id } });
      } else {
        // Estorno do recebimento como saída de caixa (mantém o histórico — NFR-11)
        await tx.cashMovement.create({
          data: {
            cashRegisterId: sale.cashRegisterId,
            type: 'OUTFLOW',
            amount: sale.total,
            description: `Estorno da venda ${sale.id.slice(-6).toUpperCase()}`,
            paymentMethod: sale.paymentMethod,
            saleId: sale.id,
          },
        });
      }

      for (const item of sale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            type: 'ENTRY',
            source: 'CANCELLATION',
            quantity: item.quantity,
            saleId: sale.id,
          },
        });
      }

      return tx.sale.update({
        where: { id: sale.id },
        data: { status: 'CANCELLED', cancelledAt: new Date() },
        include: saleInclude,
      });
    });
  }

  /** FR-24: histórico com filtros. */
  async history(params: { from?: Date; to?: Date; status?: string; page?: number }) {
    const { from, to, status, page = 1 } = params;
    const perPage = 25;
    const where: Prisma.SaleWhereInput = {
      status: status ? (status as Prisma.SaleWhereInput['status']) : { not: 'IN_PROGRESS' },
      ...(from || to
        ? { OR: [{ completedAt: { gte: from, lte: to } }, { cancelledAt: { gte: from, lte: to } }] }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: saleInclude,
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.sale.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  // ---------- helpers ----------

  private async requireInProgress(saleId: string) {
    const sale = await this.prisma.sale.findUniqueOrThrow({ where: { id: saleId } });
    if (sale.status !== 'IN_PROGRESS') {
      throw new ConflictException('Venda não está em andamento');
    }
    return sale;
  }

  private async recomputeTotals(saleId: string) {
    const sale = await this.prisma.sale.findUniqueOrThrow({
      where: { id: saleId },
      include: { items: true },
    });
    const subtotal = sale.items.reduce(
      (acc, i) => acc.add(i.unitPrice.mul(i.quantity)),
      new Decimal(0),
    );
    const total = this.applyDiscount(subtotal, sale.discountType, sale.discountValue);
    return this.prisma.sale.update({
      where: { id: saleId },
      data: { subtotal, total },
      include: saleInclude,
    });
  }

  private applyDiscount(
    subtotal: Decimal,
    type: 'AMOUNT' | 'PERCENT' | null,
    value: Decimal | null,
  ): Decimal {
    if (!type || !value) return subtotal;
    const total =
      type === 'AMOUNT'
        ? subtotal.sub(value)
        : subtotal.mul(new Decimal(100).sub(value)).div(100).toDecimalPlaces(2);
    return total.lt(0) ? new Decimal(0) : total;
  }

  /** FR-08: consome lotes na ordem de vencimento (FEFO), best-effort. */
  private async consumeBatchesFefo(tx: Prisma.TransactionClient, productId: string, qty: number) {
    let remaining = qty;
    const batches = await tx.productBatch.findMany({
      where: { productId, quantity: { gt: 0 } },
      orderBy: [{ expiresAt: 'asc' }, { createdAt: 'asc' }],
    });
    for (const batch of batches) {
      if (remaining <= 0) break;
      const consumed = Math.min(batch.quantity, remaining);
      await tx.productBatch.update({
        where: { id: batch.id },
        data: { quantity: { decrement: consumed } },
      });
      remaining -= consumed;
    }
  }
}
