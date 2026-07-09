import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  Permission,
  ProductInput,
  productSchema,
  UpdateProductInput,
  updateProductSchema,
} from '@beverage/shared';
import { AuthUser, CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @RequirePermission(Permission.PRODUCTS_READ)
  list(
    @Query('search') search?: string,
    @Query('all') all?: string,
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
  ) {
    return this.productsService.list({
      search,
      activeOnly: all !== 'true',
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
    });
  }

  @Get('by-code/:code')
  @RequirePermission(Permission.PRODUCTS_READ)
  findByCode(@Param('code') code: string) {
    return this.productsService.findByCode(code);
  }

  @Get(':id')
  @RequirePermission(Permission.PRODUCTS_READ)
  getById(@Param('id') id: string) {
    return this.productsService.getById(id);
  }

  @Post()
  @RequirePermission(Permission.PRODUCTS_WRITE)
  create(
    @CurrentUser() user: AuthUser,
    @Body(new ZodValidationPipe(productSchema)) body: ProductInput,
  ) {
    this.assertStockEntryPermission(user, body.stockEntry);
    return this.productsService.create(body);
  }

  @Patch(':id')
  @RequirePermission(Permission.PRODUCTS_WRITE)
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductInput,
  ) {
    this.assertStockEntryPermission(user, body.stockEntry);
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

  /**
   * PRODUCTS_WRITE (via @RequirePermission) só cobre o cadastro em si — uma
   * Entrada embutida no formulário (ADR 0001) exige STOCK_WRITE também, e o
   * decorator declarativo não expressa "exigido só quando o campo vier
   * preenchido".
   */
  private assertStockEntryPermission(user: AuthUser, stockEntry: unknown) {
    if (stockEntry && !user.permissions.includes(Permission.STOCK_WRITE)) {
      throw new ForbiddenException('Você não tem permissão para lançar entrada de estoque');
    }
  }
}
