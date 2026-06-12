import { BadRequestException, Injectable } from '@nestjs/common';
import { StockAdjustmentInput, StockEntryInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
  ) {}

  /** FR-05: entrada de compra/reposição — movimento + saldo na mesma transação. */
  createEntry(input: StockEntryInput) {
    return this.prisma.$transaction(async (tx) => {
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: 'ENTRY',
          source: 'PURCHASE',
          quantity: input.quantity,
          unitCost: input.unitCost,
          note: input.note,
        },
      });
      if (input.batch || input.expiresAt) {
        await tx.productBatch.create({
          data: {
            productId: input.productId,
            batch: input.batch,
            expiresAt: input.expiresAt,
            quantity: input.quantity,
          },
        });
      }
      const product = await tx.product.update({
        where: { id: input.productId },
        data: {
          currentStock: { increment: input.quantity },
          // Entrada com custo atualiza o preço de compra de referência.
          ...(input.unitCost !== undefined ? { purchasePrice: input.unitCost } : {}),
        },
      });
      return { movement, currentStock: product.currentStock };
    });
  }

  /** Ajuste manual auditável (inventário, quebra, perda). */
  createAdjustment(input: StockAdjustmentInput) {
    return this.prisma.$transaction(async (tx) => {
      if (input.quantity < 0) {
        const updated = await tx.product.updateMany({
          where: { id: input.productId, currentStock: { gte: -input.quantity } },
          data: { currentStock: { increment: input.quantity } },
        });
        if (updated.count === 0) {
          throw new BadRequestException('Ajuste deixaria o estoque negativo');
        }
      } else {
        await tx.product.update({
          where: { id: input.productId },
          data: { currentStock: { increment: input.quantity } },
        });
      }
      const movement = await tx.stockMovement.create({
        data: {
          productId: input.productId,
          type: input.quantity > 0 ? 'ENTRY' : 'EXIT',
          source: 'ADJUSTMENT',
          quantity: Math.abs(input.quantity),
          note: input.reason,
        },
      });
      return movement;
    });
  }

  listMovements(productId?: string) {
    return this.prisma.stockMovement.findMany({
      where: productId ? { productId } : undefined,
      include: { product: { select: { name: true, sku: true, unit: true } } },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  /** FR-07 (estoque mínimo) + FR-08 (validade FEFO). */
  async alerts() {
    const expiryAlertDays = await this.settings.get('expiryAlertDays');
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + expiryAlertDays);

    const [lowStockRaw, expiring] = await Promise.all([
      this.prisma.$queryRaw<
        { id: string; name: string; sku: string; currentStock: number; minimumStock: number }[]
      >`SELECT id, name, sku, "currentStock", "minimumStock"
        FROM product
        WHERE active = true AND "minimumStock" > 0 AND "currentStock" <= "minimumStock"
        ORDER BY ("currentStock"::float / NULLIF("minimumStock", 0)) ASC`,
      this.prisma.productBatch.findMany({
        where: { quantity: { gt: 0 }, expiresAt: { not: null, lte: threshold } },
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { expiresAt: 'asc' },
      }),
    ]);
    return { lowStock: lowStockRaw, expiring };
  }

  /** FR-40: posição atual de estoque. */
  async position() {
    const products = await this.prisma.product.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        sku: true,
        name: true,
        unit: true,
        currentStock: true,
        minimumStock: true,
        purchasePrice: true,
        salePrice: true,
      },
    });
    return products.map((p) => ({
      ...p,
      stockCost: p.purchasePrice.mul(p.currentStock),
      stockValue: p.salePrice.mul(p.currentStock),
    }));
  }
}
