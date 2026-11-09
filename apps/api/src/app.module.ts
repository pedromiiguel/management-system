import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { env } from './config/env';
import { AuthModule } from './modules/auth/auth.module';
import { CashRegisterModule } from './modules/cash-register/cash-register.module';
import { CustomersModule } from './modules/customers/customers.module';
import { FinancialModule } from './modules/financial/financial.module';
import { PayablesModule } from './modules/payables/payables.module';
import { ProductsModule } from './modules/products/products.module';
import { ReceivablesModule } from './modules/receivables/receivables.module';
import { ReportsModule } from './modules/reports/reports.module';
import { SalesModule } from './modules/sales/sales.module';
import { SettingsModule } from './modules/settings/settings.module';
import { StockModule } from './modules/stock/stock.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

const observe = createObserveModule();

/** Telemetria só liga com credenciais; sem elas o coletor responderia 401. */
export const ObserveInstrument = env.observe ? observe.ObserveInstrument : undefined;

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SettingsModule,
    UsersModule,
    ProductsModule,
    StockModule,
    CustomersModule,
    SalesModule,
    CashRegisterModule,
    FinancialModule,
    ReceivablesModule,
    PayablesModule,
    ReportsModule,
    ...(env.observe
      ? [observe.ObserveModule.forRoot({ ...env.observe, serviceId: 'management-system-app' })]
      : []),
  ],
})
export class AppModule {}
