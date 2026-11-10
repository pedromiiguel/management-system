import { Injectable } from '@nestjs/common';
import { StockAdjustmentInput, StockEntryInput } from '@beverage/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { SettingsService } from '../settings/settings.service';
import { StockLedger } from './stock-ledger';

@Injectable()
export class StockService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ledger: StockLedger,
    private readonly settings: SettingsService,
  ) {}

  /** FR-05: Entrada de compra/reposição. */
  createEntry(input: StockEntryInput) {
    return this.prisma.$transaction((tx) => this.ledger.entry(tx, input));
  }

  /** Ajustar: correção manual auditável (inventário, quebra, perda). */
  createAdjustment(input: StockAdjustmentInput) {
    return this.prisma.$transaction((tx) => this.ledger.adjust(tx, input));
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
    const threshold = new Date(Date.now() + expiryAlertDays * 24 * 60 * 60 * 1000);

    const [lowStock, expiring] = await Promise.all([
      this.lowStock(),
      this.prisma.productBatch.findMany({
        where: { quantity: { gt: 0 }, expiresAt: { not: null, lte: threshold } },
        include: { product: { select: { id: true, name: true, sku: true } } },
        orderBy: { expiresAt: 'asc' },
      }),
    ]);
    return { lowStock, expiring };
  }

  /**
   * FR-40: posição atual de estoque. `low` é a única regra de "abaixo do
   * mínimo" (FR-07) — usada pelo alerta e mostrada como veio pelo web.
   */
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
      low: isLowStock(p),
      stockCost: p.purchasePrice.mul(p.currentStock),
      stockValue: p.salePrice.mul(p.currentStock),
    }));
  }

  /** Produtos ativos no mínimo ou abaixo, mais críticos (menor saldo/mínimo) primeiro. */
  private async lowStock() {
    const rows = await this.position();
    return rows
      .filter((p) => p.low)
      .map(({ id, name, sku, currentStock, minimumStock }) => ({
        id,
        name,
        sku,
        currentStock,
        minimumStock,
      }))
      .sort((a, b) => a.currentStock / a.minimumStock - b.currentStock / b.minimumStock);
  }
}

/** FR-07: com mínimo definido, saldo no mínimo ou abaixo. */
function isLowStock(p: { currentStock: number; minimumStock: number }): boolean {
  return p.minimumStock > 0 && p.currentStock <= p.minimumStock;
}
