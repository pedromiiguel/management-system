import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
  ProductInput,
  ProductListQuery,
  ProductStockEntryInput,
  UpdateProductInput,
} from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { StockLedger } from '../stock/stock-ledger';

const withBatches = { batches: { orderBy: { expiresAt: 'asc' } } } satisfies Prisma.ProductInclude;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stock: StockLedger,
  ) {}

  /** Busca por nome (sem acento), SKU ou EAN (FR-03/FR-11) com paginação. */
  async list(query: ProductListQuery) {
    const { search, all, page, perPage } = query;

    // Prisma não expõe `unaccent`; os ids que casam vêm por SQL.
    let matchingIds: string[] | undefined;
    if (search) {
      const rows = await this.prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "product"
        WHERE unaccent(name) ILIKE unaccent(${`%${search}%`})
           OR sku ILIKE ${`%${search}%`}
           OR ean = ${search}
      `;
      matchingIds = rows.map((r) => r.id);
    }

    const where: Prisma.ProductWhereInput = {
      ...(all ? {} : { active: true }),
      ...(matchingIds ? { id: { in: matchingIds } } : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.product.count({ where }),
    ]);
    return { items, total, page, perPage };
  }

  /** Resolução exata para o PDV: EAN → SKU → id (FR-10). */
  async findByCode(code: string) {
    const product = await this.prisma.product.findFirst({
      where: { OR: [{ ean: code }, { sku: code }, { id: code }] },
    });
    if (!product) throw new NotFoundException(`Produto não encontrado para o código "${code}"`);
    if (!product.active) throw new BadRequestException('Produto está desativado');
    return product;
  }

  create(input: ProductInput) {
    const { stockEntry, ean, ...data } = input;
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.create({ data: { ...data, ean: ean || null } });
      return this.withEntry(tx, product.id, stockEntry);
    });
  }

  update(id: string, input: UpdateProductInput) {
    const { stockEntry, ean, ...data } = input;
    return this.prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: { ...data, ...(ean === undefined ? {} : { ean: ean || null }) },
      });
      return this.withEntry(tx, id, stockEntry);
    });
  }

  async deactivate(id: string) {
    return this.prisma.product.update({ where: { id }, data: { active: false } });
  }

  /**
   * Excluir (CONTEXT.md): produto com venda registrada não é excluído, só
   * desativado (BR-04). Sem venda, sai o cadastro junto com suas linhas de
   * estoque (Entradas, Ajustes, lotes), numa transação.
   */
  async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      if ((await tx.saleItem.count({ where: { productId: id } })) > 0) {
        throw new BadRequestException(
          'Produto possui vendas registradas e não pode ser excluído — desative-o (BR-04)',
        );
      }
      await this.stock.deleteProductRows(tx, id);
      await tx.product.delete({ where: { id } });
      return { deleted: true };
    });
  }

  /** Entrada embutida no cadastro (o custo é o preço de compra do produto). */
  private async withEntry(
    tx: Prisma.TransactionClient,
    productId: string,
    entry: ProductStockEntryInput | undefined,
  ) {
    if (entry) {
      await this.stock.entry(tx, {
        productId,
        ...entry,
        note: 'Entrada lançada no cadastro do produto',
      });
    }
    return tx.product.findUniqueOrThrow({ where: { id: productId }, include: withBatches });
  }
}
