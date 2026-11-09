import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  Permission,
  ProductInput,
  ProductListQuery,
  productListQuerySchema,
  productSchema,
  UpdateProductInput,
  updateProductSchema,
} from '@beverage/shared';
import { AuthUser, CurrentUser } from '../auth/current-user.decorator';
import { RequirePermission } from '../auth/require-permission.decorator';
import { assertPermission } from '../auth/permissions.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductsService } from './products.service';

/** A Entrada embutida no formulário (`stockEntry`) é movimento de estoque: exige também STOCK_WRITE. */
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission(Permission.PRODUCTS_READ)
  list(@Query(new ZodValidationPipe(productListQuerySchema)) query: ProductListQuery) {
    return this.productsService.list(query);
  }

  @Post()
  @RequirePermission(Permission.PRODUCTS_WRITE)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(productSchema)) body: ProductInput,
  ) {
    if (body.stockEntry) assertPermission(user, Permission.STOCK_WRITE);
    return this.productsService.create(body);
  }

  @Patch(':id')
  @RequirePermission(Permission.PRODUCTS_WRITE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductInput,
  ) {
    if (body.stockEntry) assertPermission(user, Permission.STOCK_WRITE);
    return this.productsService.update(id, body);
  }

  @Patch(':id/deactivate')
  @RequirePermission(Permission.PRODUCTS_WRITE)
  deactivate(@Param('id') id: string) {
    return this.productsService.deactivate(id);
  }

  @Delete(':id')
  @RequirePermission(Permission.PRODUCTS_WRITE)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
