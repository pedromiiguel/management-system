import { ForbiddenException } from '@nestjs/common';
import { Permission } from '@beverage/shared';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController — entrada de estoque embutida (ADR 0001)', () => {
  const productsService = {
    create: jest.fn(),
    update: jest.fn(),
  } as unknown as ProductsService;
  const controller = new ProductsController(productsService);

  const userWith = (...permissions: Permission[]): AuthUser => ({
    id: 'u1',
    name: 'Teste',
    login: 'teste',
    roleId: 'r1',
    permissions,
  });

  beforeEach(() => jest.clearAllMocks());

  it('permite criar produto sem stockEntry mesmo sem stock.write', () => {
    const user = userWith(Permission.PRODUCTS_WRITE);
    const body = { name: 'X', sku: 'X1' } as never;
    expect(() => controller.create(user, body)).not.toThrow();
    expect(productsService.create).toHaveBeenCalledWith(body);
  });

  it('rejeita stockEntry quando o usuário não tem stock.write', () => {
    const user = userWith(Permission.PRODUCTS_WRITE);
    const body = { name: 'X', sku: 'X1', stockEntry: { quantity: 10 } } as never;
    expect(() => controller.create(user, body)).toThrow(ForbiddenException);
    expect(productsService.create).not.toHaveBeenCalled();
  });

  it('permite stockEntry quando o usuário tem products.write e stock.write', () => {
    const user = userWith(Permission.PRODUCTS_WRITE, Permission.STOCK_WRITE);
    const body = { name: 'X', sku: 'X1', stockEntry: { quantity: 10 } } as never;
    expect(() => controller.create(user, body)).not.toThrow();
    expect(productsService.create).toHaveBeenCalledWith(body);
  });

  it('mesma checagem vale para update (edição)', () => {
    const user = userWith(Permission.PRODUCTS_WRITE);
    const body = { stockEntry: { quantity: 5 } } as never;
    expect(() => controller.update(user, 'p1', body)).toThrow(ForbiddenException);
    expect(productsService.update).not.toHaveBeenCalled();
  });
});
