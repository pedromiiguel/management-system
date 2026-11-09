import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  FinancialCategoryInput,
  financialCategorySchema,
  ManualEntryInput,
  manualEntrySchema,
  Permission,
  PeriodQuery,
  periodQuerySchema,
} from '@beverage/shared';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { FinancialService } from './financial.service';

@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  @Get('cash-flow')
  @RequirePermission(Permission.FINANCIAL_READ)
  cashFlow(@Query(new ZodValidationPipe(periodQuerySchema)) period: PeriodQuery) {
    return this.financialService.cashFlow(period);
  }

  @Get('dashboard')
  @RequirePermission(Permission.FINANCIAL_READ)
  dashboard() {
    return this.financialService.dashboard();
  }

  @Post('entries')
  @RequirePermission(Permission.FINANCIAL_WRITE)
  manualEntry(@Body(new ZodValidationPipe(manualEntrySchema)) body: ManualEntryInput) {
    return this.financialService.manualEntry(body);
  }

  @Get('categories')
  @RequirePermission(Permission.FINANCIAL_READ)
  listCategories() {
    return this.financialService.listCategories();
  }

  @Post('categories')
  @RequirePermission(Permission.SETTINGS_WRITE)
  createCategory(
    @Body(new ZodValidationPipe(financialCategorySchema)) body: FinancialCategoryInput,
  ) {
    return this.financialService.createCategory(body);
  }
}
