import { Module } from '@nestjs/common';
import { CashRegisterModule } from '../cash-register/cash-register.module';
import { SalesModule } from '../sales/sales.module';
import { SettingsModule } from '../settings/settings.module';
import { FinancialController } from './financial.controller';
import { FinancialService } from './financial.service';

@Module({
  imports: [CashRegisterModule, SalesModule, SettingsModule],
  controllers: [FinancialController],
  providers: [FinancialService],
})
export class FinancialModule {}
