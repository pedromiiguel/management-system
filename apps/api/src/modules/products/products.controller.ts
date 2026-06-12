import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  Permission,
  ProductInput,
  productSchema,
  UpdateProductInput,
  updateProductSchema,
} from '@beverage/shared';
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
  create(@Body(new ZodValidationPipe(productSchema)) body: ProductInput) {
    return this.productsService.create(body);
  }

  @Patch(':id')
  @RequirePermission(Permission.PRODUCTS_WRITE)
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateProductSchema)) body: UpdateProductInput,
  ) {
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
