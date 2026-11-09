import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  Permission,
  ReceivableListQuery,
  receivableListQuerySchema,
  SettleReceivableInput,
  settleReceivableSchema,
} from '@beverage/shared';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ReceivablesService } from './receivables.service';

@Controller('receivables')
export class ReceivablesController {
  constructor(private readonly receivablesService: ReceivablesService) {}

  @Get()
  @RequirePermission(Permission.FINANCIAL_READ)
  list(@Query(new ZodValidationPipe(receivableListQuerySchema)) query: ReceivableListQuery) {
    return this.receivablesService.list(query);
  }

  @Post(':id/settle')
  @RequirePermission(Permission.FINANCIAL_WRITE)
  settle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(settleReceivableSchema)) body: SettleReceivableInput,
  ) {
    return this.receivablesService.settle(id, body);
  }
}
