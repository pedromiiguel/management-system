import { Module } from '@nestjs/common';
import { CashLedger } from './cash-ledger';
import { CashRegisterController } from './cash-register.controller';
import { CashRegisterService } from './cash-register.service';

@Module({
  controllers: [CashRegisterController],
  providers: [CashRegisterService, CashLedger],
  exports: [CashLedger],
})
export class CashRegisterModule {}
