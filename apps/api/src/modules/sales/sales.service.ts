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
  priceSale,
  saleCode,
  SaleHistoryQuery,
  SaleStatus,
  SystemCategory,
} from '@beverage/shared';
import { isUniqueViolation } from '../../prisma/errors';
import { PrismaService } from '../../prisma/prisma.service';
import { CashLedger } from '../cash-register/cash-ledger';
import { ProductsService } from '../products/products.service';
import { ReceivablesService } from '../receivables/receivables.service';
import { SettingsService } from '../settings/settings.service';
import { StockLedger } from '../stock/stock-ledger';

const Decimal = Prisma.Decimal;
type Decimal = Prisma.Decimal;
type Db = Prisma.TransactionClient;

const HISTORY_PAGE_SIZE = 25;

const saleInclude = {
  items: {
    include: { product: { select: { name: true, sku: true, ean: true, unit: true } } },
    orderBy: { id: 'asc' as const },
  },
  customer: { select: { id: true, name: true } },
  operator: { select: { id: true, name: true } },
} satisfies Prisma.SaleInclude;

/**
 * Ciclo de vida da Venda (CONTEXT.md): abrir → Bipar/Alterar quantidade/
 * Remover → concluir; Cancelar (em andamento) ou Estornar (concluída).
 *
 * Valores: `subtotal`, `serviceFee` e `total` vêm sempre de `priceSale`
 * (@beverage/shared) e são regravados a cada alteração. `total` é sempre o
 * valor devido — já inclui a Taxa de serviço quando ligada (`serviceFee` não
 * nulo = taxa ligada).
 */
@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly products: ProductsService,
    private readonly settings: SettingsService,
    private readonly stock: StockLedger,
    private readonly cash: CashLedger,
    private readonly receivables: ReceivablesService,
  ) {}

  /**
   * FR-09: abre o "carrinho". Reaproveita a venda em andamento do operador —
   * só pode haver uma (índice único parcial), inclusive com aberturas simultâneas.
   */
  async open(operatorId: string) {
    const inProgress = () =>
      this.prisma.sale.findFirst({
        where: { operatorId, status: SaleStatus.IN_PROGRESS },
        include: saleInclude,
      });
    const existing = await inProgress();
    if (existing) return existing;
    try {
      return await this.prisma.sale.create({ data: { operatorId }, include: saleInclude });
    } catch (error) {
      const opened = isUniqueViolation(error) ? await inProgress() : null;
      if (opened) return opened;
      throw error;
    }
  }

  /**
   * Bipar (FR-10/11/12/15): soma a quantidade se o produto já está na venda.
   * Devolve o item bipado (`itemId`) — criado ou somado.
   */
  async addItem(saleId: string, input: AddSaleItemInput) {
    let warning: string | null = null;
    let itemId = '';
    const sale = await this.changeInProgress(saleId, async (tx) => {
      const product = await this.products.findByCode(input.code);
      const existing = await tx.saleItem.findUnique({
        where: { saleId_productId: { saleId, productId: product.id } },
      });
      const quantity = (existing?.quantity ?? 0) + input.quantity;
      warning = this.stock.checkAvailability(product, quantity, await this.stockPolicy());
      const item = existing
        ? await tx.saleItem.update({ where: { id: existing.id }, data: { quantity } })
        : await tx.saleItem.create({
            data: {
              saleId,
              productId: product.id,
              quantity,
              unitPrice: product.salePrice,
              unitCost: product.purchasePrice,
            },
          });
      itemId = item.id;
    });
    return { sale, itemId, warning };
  }

  /** Alterar quantidade (FR-14) de um Item já na venda. */
  async updateItem(saleId: string, itemId: string, quantity: number) {
    let warning: string | null = null;
    const sale = await this.changeInProgress(saleId, async (tx) => {
      const item = await tx.saleItem.findFirst({
        where: { id: itemId, saleId },
        include: { product: true },
      });
      if (!item) throw new NotFoundException('Item não encontrado nesta venda');
      warning = this.stock.checkAvailability(item.product, quantity, await this.stockPolicy());
      await tx.saleItem.update({ where: { id: itemId }, data: { quantity } });
    });
    return { sale, warning };
  }

  /** Remover (FR-14) um Item da venda em andamento. */
  removeItem(saleId: string, itemId: string) {
    return this.changeInProgress(saleId, (tx) =>
      tx.saleItem.deleteMany({ where: { id: itemId, saleId } }),
    );
  }

  /** FR-16: desconto em valor ou percentual. */
  setDiscount(saleId: string, discount: DiscountInput | null) {
    return this.changeInProgress(saleId, (tx) =>
      tx.sale.update({
        where: { id: saleId },
        data: {
          discountType: discount?.type ?? null,
          discountValue: discount ? new Decimal(discount.value) : null,
        },
      }),
    );
  }

  /** Liga/desliga a Taxa de serviço; o total passa a refleti-la imediatamente. */
  setServiceFee(saleId: string, enabled: boolean) {
    // O valor exato é calculado em `reprice`; aqui só liga (≠ null) ou desliga.
    return this.changeInProgress(saleId, (tx) =>
      tx.sale.update({
        where: { id: saleId },
        data: { serviceFee: enabled ? new Decimal(0) : null },
      }),
    );
  }

  /** Cancelar (FR-21): abandona a venda em andamento — nada de estoque/financeiro foi tocado. */
  async cancelInProgress(saleId: string) {
    await this.requireInProgress(this.prisma, saleId);
    return this.prisma.sale.update({
      where: { id: saleId },
      data: { status: SaleStatus.CANCELLED, cancelledAt: new Date() },
      include: saleInclude,
    });
  }

  /**
   * FR-20/BR-07: conclusão ATÔMICA — baixa de estoque, venda e lançamento
   * financeiro na mesma transação; qualquer falha desfaz tudo.
   */
  async complete(saleId: string, input: CompleteSaleInput) {
    const { enabledPaymentMethods, stockPolicy } = await this.settings.getAll();
    if (!enabledPaymentMethods.includes(input.paymentMethod)) {
      throw new BadRequestException('Forma de pagamento desabilitada nas configurações');
    }
    // O schema garante: dinheiro traz o valor recebido; a prazo traz o cliente.
    const amountPaid = input.paymentMethod === PaymentMethod.CASH ? input.amountPaid : null;

    return this.prisma.$transaction(async (tx) => {
      await this.requireInProgress(tx, saleId);
      const sale = await tx.sale.findUniqueOrThrow({
        where: { id: saleId },
        include: { items: { include: { product: true } } },
      });
      if (sale.items.length === 0) throw new BadRequestException('Venda sem itens');

      const price = priceOf(sale, amountPaid);
      if (price.change !== null && price.change < 0) {
        throw new BadRequestException('Valor recebido é menor que o total da venda');
      }
      const total = toDecimal(price.total);

      await this.stock.exitForSale(tx, sale.id, sale.items, stockPolicy);

      let cashRegisterId: string | null = null;
      if (input.paymentMethod === PaymentMethod.CREDIT) {
        await this.receivables.createForSale(tx, {
          customerId: input.customerId,
          saleId: sale.id,
          amount: total,
          dueDate: input.dueDate,
        });
      } else {
        const { register } = await this.cash.receive(tx, {
          amount: total,
          paymentMethod: input.paymentMethod,
          description: `Venda ${saleCode(sale.id)}`,
          category: SystemCategory.SALES,
          saleId: sale.id,
        });
        cashRegisterId = register?.id ?? null;
      }

      return tx.sale.update({
        where: { id: sale.id },
        data: {
          status: SaleStatus.COMPLETED,
          completedAt: new Date(),
          ...pricingColumns(price),
          paymentMethod: input.paymentMethod,
          amountPaid: amountPaid === null ? null : toDecimal(amountPaid),
          change: price.change === null ? null : toDecimal(price.change),
          withInvoice: input.withInvoice,
          customerId: input.customerId,
          cashRegisterId,
        },
        include: saleInclude,
      });
    });
  }

  /**
   * Estornar (FR-22/BR-05): itens voltam ao estoque (e aos lotes), o valor é
   * devolvido pelo caixa aberto agora — ou o fiado é desfeito. O registro fica
   * como VOIDED para auditoria.
   */
  async void(saleId: string) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findUniqueOrThrow({ where: { id: saleId } });
      if (sale.status !== SaleStatus.COMPLETED) {
        throw new ConflictException('Apenas vendas concluídas podem ser estornadas');
      }

      if (sale.paymentMethod === PaymentMethod.CREDIT) {
        await this.receivables.cancelForSale(tx, sale.id);
      } else {
        await this.cash.refundSale(tx, {
          amount: sale.total,
          paymentMethod: sale.paymentMethod!,
          description: `Estorno da venda ${saleCode(sale.id)}`,
          saleId: sale.id,
        });
      }
      await this.stock.returnForVoid(tx, sale.id);

      return tx.sale.update({
        where: { id: sale.id },
        data: { status: SaleStatus.VOIDED, voidedAt: new Date() },
        include: saleInclude,
      });
    });
  }

  /** FR-24: histórico (concluídas, canceladas e estornadas) com filtros. */
  async history(query: SaleHistoryQuery) {
    const { from, to, status, page } = query;
    const range = { gte: from, lte: to };
    const where: Prisma.SaleWhereInput = {
      status: status ?? { not: SaleStatus.IN_PROGRESS },
      ...(from || to
        ? { OR: [{ completedAt: range }, { cancelledAt: range }, { voidedAt: range }] }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        include: saleInclude,
        orderBy: { openedAt: 'desc' },
        skip: (page - 1) * HISTORY_PAGE_SIZE,
        take: HISTORY_PAGE_SIZE,
      }),
      this.prisma.sale.count({ where }),
    ]);
    return { items, total, page, perPage: HISTORY_PAGE_SIZE };
  }

  // ---------- helpers ----------

  /**
   * Toda alteração de venda em andamento: confere o status, aplica a mudança e
   * reprecifica, numa transação. Devolve a venda atualizada.
   */
  private changeInProgress(saleId: string, change: (tx: Db) => Promise<unknown>) {
    return this.prisma.$transaction(async (tx) => {
      await this.requireInProgress(tx, saleId);
      await change(tx);
      return this.reprice(tx, saleId);
    });
  }

  private async requireInProgress(db: Db, saleId: string) {
    const sale = await db.sale.findUniqueOrThrow({ where: { id: saleId } });
    if (sale.status !== SaleStatus.IN_PROGRESS) {
      throw new ConflictException('Venda não está em andamento');
    }
    return sale;
  }

  private async reprice(db: Db, saleId: string) {
    const sale = await db.sale.findUniqueOrThrow({
      where: { id: saleId },
      include: { items: true },
    });
    return db.sale.update({
      where: { id: saleId },
      data: pricingColumns(priceOf(sale, null)),
      include: saleInclude,
    });
  }

  private stockPolicy() {
    return this.settings.get('stockPolicy');
  }
}

function priceOf(
  sale: {
    items: { unitPrice: Decimal; quantity: number }[];
    discountType: DiscountInput['type'] | null;
    discountValue: Decimal | null;
    serviceFee: Decimal | null;
  },
  amountPaid: number | null,
) {
  return priceSale({
    items: sale.items.map((i) => ({ unitPrice: i.unitPrice.toNumber(), quantity: i.quantity })),
    discount:
      sale.discountType && sale.discountValue
        ? { type: sale.discountType, value: sale.discountValue.toNumber() }
        : null,
    serviceFee: sale.serviceFee !== null,
    amountPaid,
  });
}

function pricingColumns(price: ReturnType<typeof priceSale>) {
  return {
    subtotal: toDecimal(price.subtotal),
    serviceFee: price.serviceFee === null ? null : toDecimal(price.serviceFee),
    total: toDecimal(price.total),
  };
}

/** `priceSale` devolve reais exatos em centavos; `toFixed(2)` os traz de volta sem perda. */
function toDecimal(reais: number): Decimal {
  return new Decimal(reais.toFixed(2));
}
