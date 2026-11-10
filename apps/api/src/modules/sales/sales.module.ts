import { Module } from '@nestjs/common';
import { CashRegisterModule } from '../cash-register/cash-register.module';
import { ProductsModule } from '../products/products.module';
import { ReceivablesModule } from '../receivables/receivables.module';
import { SettingsModule } from '../settings/settings.module';
import { StockModule } from '../stock/stock.module';
import { SalesController } from './sales.controller';
import { SalesQuery } from './sales-query';
import { SalesService } from './sales.service';

@Module({
  imports: [ProductsModule, StockModule, CashRegisterModule, ReceivablesModule, SettingsModule],
  controllers: [SalesController],
  providers: [SalesService, SalesQuery],
  exports: [SalesQuery],
})
export class SalesModule {}
