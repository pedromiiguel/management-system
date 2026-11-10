import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  CustomerInput,
  CustomerListQuery,
  customerListQuerySchema,
  customerSchema,
  Permission,
} from '@beverage/shared';
import { RequirePermission } from '../auth/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  @RequirePermission(Permission.CUSTOMERS_READ)
  list(@Query(new ZodValidationPipe(customerListQuerySchema)) query: CustomerListQuery) {
    return this.customersService.list(query.search);
  }

  @Post()
  @RequirePermission(Permission.CUSTOMERS_WRITE)
  create(@Body(new ZodValidationPipe(customerSchema)) body: CustomerInput) {
    return this.customersService.create(body);
  }
}
