import { Module } from '@nestjs/common';
import { SettingsModule } from '../settings/settings.module';
import { StockController } from './stock.controller';
import { StockLedger } from './stock-ledger';
import { StockService } from './stock.service';

@Module({
  imports: [SettingsModule],
  controllers: [StockController],
  providers: [StockService, StockLedger],
  exports: [StockService, StockLedger],
})
export class StockModule {}
