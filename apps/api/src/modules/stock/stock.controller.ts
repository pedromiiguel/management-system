import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  Permission,
  StockAdjustmentInput,
  stockAdjustmentSchema,
  StockEntryInput,
  stockEntrySchema,
} from '@beverage/shared';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { StockService } from './stock.service';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post('entries')
  @RequirePermission(Permission.STOCK_WRITE)
  createEntry(@Body(new ZodValidationPipe(stockEntrySchema)) body: StockEntryInput) {
    return this.stockService.createEntry(body);
  }

  @Post('adjustments')
  @RequirePermission(Permission.STOCK_WRITE)
  createAdjustment(
    @Body(new ZodValidationPipe(stockAdjustmentSchema)) body: StockAdjustmentInput,
  ) {
    return this.stockService.createAdjustment(body);
  }

  @Get('movements')
  @RequirePermission(Permission.STOCK_READ)
  listMovements(@Query('productId') productId?: string) {
    return this.stockService.listMovements(productId);
  }

  @Get('alerts')
  @RequirePermission(Permission.STOCK_READ)
  alerts() {
    return this.stockService.alerts();
  }

  @Get('position')
  @RequirePermission(Permission.STOCK_READ)
  position() {
    return this.stockService.position();
  }
}
