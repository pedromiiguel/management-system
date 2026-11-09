import { Module } from '@nestjs/common';
import { SalesModule } from '../sales/sales.module';
import { StockModule } from '../stock/stock.module';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

@Module({
  imports: [SalesModule, StockModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
