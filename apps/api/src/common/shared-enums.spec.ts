import { $Enums } from '@prisma/client';
import * as shared from '@beverage/shared';

/**
 * Os enums de @beverage/shared são o vocabulário usado pela API e pelo web;
 * os do Prisma são o que o banco aceita. Os dois precisam ser iguais.
 */
describe('enums do shared × enums do Prisma', () => {
  const pairs: [string, Record<string, string>, Record<string, string>][] = [
    ['PaymentMethod', shared.PaymentMethod, $Enums.PaymentMethod],
    ['SaleStatus', shared.SaleStatus, $Enums.SaleStatus],
    ['DiscountType', shared.DiscountType, $Enums.DiscountType],
    ['StockMovementType', shared.StockMovementType, $Enums.StockMovementType],
    ['StockMovementSource', shared.StockMovementSource, $Enums.StockMovementSource],
    ['CashRegisterStatus', shared.CashRegisterStatus, $Enums.CashRegisterStatus],
    ['CashMovementType', shared.CashMovementType, $Enums.CashMovementType],
    ['ReceivableStatus', shared.ReceivableStatus, $Enums.ReceivableStatus],
    ['PayableStatus', shared.PayableStatus, $Enums.PayableStatus],
    ['FinancialCategoryKind', shared.FinancialCategoryKind, $Enums.FinancialCategoryKind],
    ['SystemCategory', shared.SystemCategory, $Enums.SystemCategory],
  ];

  it('cobre todos os enums do schema', () => {
    expect(pairs.map(([name]) => name).sort()).toEqual(Object.keys($Enums).sort());
  });

  it.each(pairs)('%s tem os mesmos valores', (_name, sharedEnum, prismaEnum) => {
    expect(Object.values(sharedEnum).sort()).toEqual(Object.values(prismaEnum).sort());
  });
});
