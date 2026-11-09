import { Module } from '@nestjs/common';
import { CashRegisterModule } from '../cash-register/cash-register.module';
import { PayablesController } from './payables.controller';
import { PayablesService } from './payables.service';

@Module({
  imports: [CashRegisterModule],
  controllers: [PayablesController],
  providers: [PayablesService],
})
export class PayablesModule {}
