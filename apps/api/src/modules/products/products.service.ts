import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductInput, UpdateProductInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Busca por nome, SKU ou EAN (FR-03/FR-11) com paginação. */
  async list(params: { search?: string; activeOnly?: boolean; page?: number; perPage?: number }) {
    const { search, activeOnly = true, page = 1, perPage = 50 } = params;
    const where: Prisma.ProductWhereInput = {
      ...(activeOnly ? { active: true } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
              { ean: search },
            ],
          }
        : {}),
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

  getById(id: string) {
    return this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: { batches: { orderBy: { expiresAt: 'asc' } } },
    });
  }

  create(input: ProductInput) {
    return this.prisma.product.create({ data: this.normalize(input) });
  }

  update(id: string, input: UpdateProductInput) {
    return this.prisma.product.update({ where: { id }, data: this.normalize(input) });
  }

  /** BR-04: produto com vendas não é excluído — apenas desativado. */
  async deactivate(id: string) {
    return this.prisma.product.update({ where: { id }, data: { active: false } });
  }

  async remove(id: string) {
    const salesCount = await this.prisma.saleItem.count({ where: { productId: id } });
    if (salesCount > 0) {
      throw new BadRequestException(
        'Produto possui vendas registradas e não pode ser excluído — desative-o (BR-04)',
      );
    }
    await this.prisma.$transaction([
      this.prisma.productBatch.deleteMany({ where: { productId: id } }),
      this.prisma.stockMovement.deleteMany({ where: { productId: id } }),
      this.prisma.product.delete({ where: { id } }),
    ]);
    return { deleted: true };
  }

  private normalize<T extends { ean?: string | null }>(input: T): T {
    // EAN vazio vira null para não colidir com a unique constraint.
    return { ...input, ean: input.ean ? input.ean : null };
  }
}
