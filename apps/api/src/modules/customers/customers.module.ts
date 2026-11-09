import { Module } from '@nestjs/common';
import { ReceivablesModule } from '../receivables/receivables.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';

@Module({
  imports: [ReceivablesModule],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
