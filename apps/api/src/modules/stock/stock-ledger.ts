import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StockMovementSource, StockMovementType, StockPolicy } from '@beverage/shared';

type Db = Prisma.TransactionClient;

export interface EntryInput {
  productId: string;
  quantity: number;
  /** Custo unitário da compra; atualiza o preço de compra de referência. Sem ele, vale o preço atual. */
  unitCost?: number;
  batch?: string;
  expiresAt?: Date;
  note?: string;
}

/**
 * Único escritor das tabelas de estoque: `product.currentStock`,
 * `stock_movement`, `product_batch` e `stock_movement_batch`. Saldo, movimento e
 * lotes mudam sempre juntos. Todo método recebe o `db` (transação) de quem
 * chama, para entrar na mesma transação da venda, do cadastro etc.
 *
 * Regras:
 * - Entrada soma ao saldo; com lote/validade cria um lote.
 * - Toda saída (venda, ajuste para menos) consome lotes em FEFO.
 * - Estorno devolve ao saldo e aos mesmos lotes que a venda consumiu.
 * - O saldo só fica negativo por venda com política WARN; Ajustar nunca o deixa negativo.
 */
@Injectable()
export class StockLedger {
  /**
   * Única decisão "estoque insuficiente × política" (BR-03/FR-15). Com BLOCK
   * lança 409; com WARN devolve o aviso. `null` = há saldo.
   */
  checkAvailability(
    product: { name: string; currentStock: number },
    requested: number,
    policy: StockPolicy,
  ): string | null {
    if (requested <= product.currentStock) return null;
    const message = insufficientStockMessage(product.name, product.currentStock, requested);
    if (policy === StockPolicy.BLOCK) throw new ConflictException(message);
    return message;
  }

  /** Entrada (CONTEXT.md): sempre aditiva. */
  async entry(db: Db, input: EntryInput) {
    const product = await db.product.update({
      where: { id: input.productId },
      data: {
        currentStock: { increment: input.quantity },
        ...(input.unitCost !== undefined ? { purchasePrice: input.unitCost } : {}),
      },
    });
    const movement = await db.stockMovement.create({
      data: {
        productId: input.productId,
        type: StockMovementType.ENTRY,
        source: StockMovementSource.PURCHASE,
        quantity: input.quantity,
        unitCost: product.purchasePrice,
        note: input.note,
      },
    });
    if (input.batch || input.expiresAt) {
      const batch = await db.productBatch.create({
        data: {
          productId: input.productId,
          batch: input.batch,
          expiresAt: input.expiresAt,
          quantity: input.quantity,
        },
      });
      await db.stockMovementBatch.create({
        data: { movementId: movement.id, batchId: batch.id, quantity: input.quantity },
      });
    }
    return { movement, currentStock: product.currentStock };
  }

  /** Ajustar (CONTEXT.md): correção auditável com motivo; nunca deixa o saldo negativo. */
  async adjust(db: Db, input: { productId: string; quantity: number; reason: string }) {
    if (input.quantity < 0) {
      const updated = await db.product.updateMany({
        where: { id: input.productId, currentStock: { gte: -input.quantity } },
        data: { currentStock: { increment: input.quantity } },
      });
      if (updated.count === 0) {
        throw new BadRequestException('Ajuste deixaria o estoque negativo');
      }
    } else {
      await db.product.update({
        where: { id: input.productId },
        data: { currentStock: { increment: input.quantity } },
      });
    }
    const movement = await db.stockMovement.create({
      data: {
        productId: input.productId,
        type: input.quantity > 0 ? StockMovementType.ENTRY : StockMovementType.EXIT,
        source: StockMovementSource.ADJUSTMENT,
        quantity: Math.abs(input.quantity),
        note: input.reason,
      },
    });
    if (input.quantity < 0) {
      await this.consumeBatchesFefo(db, movement.id, input.productId, -input.quantity);
    }
    return movement;
  }

  /** Baixa da venda concluída, com guarda contra corrida quando a política é BLOCK. */
  async exitForSale(
    db: Db,
    saleId: string,
    items: { productId: string; quantity: number; product: { name: string } }[],
    policy: StockPolicy,
  ) {
    for (const item of items) {
      const guard = policy === StockPolicy.BLOCK ? { currentStock: { gte: item.quantity } } : {};
      const updated = await db.product.updateMany({
        where: { id: item.productId, ...guard },
        data: { currentStock: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        const product = await db.product.findUniqueOrThrow({ where: { id: item.productId } });
        throw new ConflictException(
          insufficientStockMessage(item.product.name, product.currentStock, item.quantity),
        );
      }
      const movement = await db.stockMovement.create({
        data: {
          productId: item.productId,
          type: StockMovementType.EXIT,
          source: StockMovementSource.SALE,
          quantity: item.quantity,
          saleId,
        },
      });
      await this.consumeBatchesFefo(db, movement.id, item.productId, item.quantity);
    }
  }

  /** Estorno: desfaz cada saída da venda, inclusive nos lotes que ela consumiu. */
  async returnForVoid(db: Db, saleId: string) {
    const exits = await db.stockMovement.findMany({
      where: { saleId, type: StockMovementType.EXIT, source: StockMovementSource.SALE },
      include: { batches: true },
    });
    for (const exit of exits) {
      await db.product.update({
        where: { id: exit.productId },
        data: { currentStock: { increment: exit.quantity } },
      });
      const movement = await db.stockMovement.create({
        data: {
          productId: exit.productId,
          type: StockMovementType.ENTRY,
          source: StockMovementSource.CANCELLATION,
          quantity: exit.quantity,
          saleId,
        },
      });
      for (const allocation of exit.batches) {
        await db.productBatch.update({
          where: { id: allocation.batchId },
          data: { quantity: { increment: allocation.quantity } },
        });
        await db.stockMovementBatch.create({
          data: {
            movementId: movement.id,
            batchId: allocation.batchId,
            quantity: allocation.quantity,
          },
        });
      }
    }
  }

  /** Produto que já movimentou estoque tem histórico de auditoria. */
  async hasHistory(db: Db, productId: string) {
    return (await db.stockMovement.count({ where: { productId } })) > 0;
  }

  /** FR-08: consome lotes na ordem de vencimento (FEFO), até onde houver lote. */
  private async consumeBatchesFefo(
    db: Db,
    movementId: string,
    productId: string,
    quantity: number,
  ) {
    let remaining = quantity;
    const batches = await db.productBatch.findMany({
      where: { productId, quantity: { gt: 0 } },
      orderBy: [{ expiresAt: { sort: 'asc', nulls: 'last' } }, { createdAt: 'asc' }],
    });
    for (const batch of batches) {
      if (remaining <= 0) break;
      const consumed = Math.min(batch.quantity, remaining);
      await db.productBatch.update({
        where: { id: batch.id },
        data: { quantity: { decrement: consumed } },
      });
      await db.stockMovementBatch.create({
        data: { movementId, batchId: batch.id, quantity: consumed },
      });
      remaining -= consumed;
    }
  }
}

function insufficientStockMessage(name: string, available: number, requested: number) {
  return `Estoque insuficiente de "${name}": disponível ${available}, solicitado ${requested}`;
}
