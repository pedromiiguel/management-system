import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';

@Module({
  imports: [ProductsModule],
  controllers: [SalesController],
  providers: [SalesService],
})
export class SalesModule {}
