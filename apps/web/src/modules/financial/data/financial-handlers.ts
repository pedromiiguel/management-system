import { HttpMethod } from '@shared/http';
import { BaseService } from '@data/base-service/base-service';
import type {
  ICashRegisterGateway,
  IFinancialGateway,
  IPayablesGateway,
  IReceivablesGateway,
} from '../domain/financial-gateways';
import type {
  ICashFlow,
  ICashRegister,
  IDashboard,
  IFinancialCategory,
  IPayable,
  IPeriod,
  IReceivable,
  TCashMovementParams,
  TCloseRegisterParams,
  TCreateCategoryParams,
  TCreatePayableParams,
  TManualEntryParams,
  TOpenRegisterParams,
  TSettleReceivableParams,
} from '../domain/financial-model';

export class FinancialHandler extends BaseService implements IFinancialGateway {
  getDashboard() {
    return this.send<IDashboard>({ url: '/financial/dashboard', method: HttpMethod.GET });
  }

  getCashFlow({ from, to }: IPeriod) {
    return this.send<ICashFlow>({
      url: '/financial/cash-flow',
      method: HttpMethod.GET,
      queryParams: { from, to },
    });
  }

  listCategories() {
    return this.send<IFinancialCategory[]>({
      url: '/financial/categories',
      method: HttpMethod.GET,
    });
  }

  async createCategory(params: TCreateCategoryParams) {
    await this.send({ url: '/financial/categories', method: HttpMethod.POST, body: params });
  }

  async createManualEntry(params: TManualEntryParams) {
    await this.send({ url: '/financial/entries', method: HttpMethod.POST, body: params });
  }
}

export class CashRegisterHandler extends BaseService implements ICashRegisterGateway {
  getCurrent() {
    return this.send<ICashRegister | null>({
      url: '/cash-register/current',
      method: HttpMethod.GET,
    });
  }

  getHistory() {
    return this.send<ICashRegister[]>({ url: '/cash-register/history', method: HttpMethod.GET });
  }

  async open(params: TOpenRegisterParams) {
    await this.send({ url: '/cash-register/open', method: HttpMethod.POST, body: params });
  }

  async createMovement(params: TCashMovementParams) {
    await this.send({ url: '/cash-register/movements', method: HttpMethod.POST, body: params });
  }

  close(params: TCloseRegisterParams) {
    return this.send<ICashRegister>({
      url: '/cash-register/close',
      method: HttpMethod.POST,
      body: params,
    });
  }
}

export class ReceivablesHandler extends BaseService implements IReceivablesGateway {
  listOpen() {
    return this.send<IReceivable[]>({ url: '/receivables', method: HttpMethod.GET });
  }

  async settle({ id, input }: TSettleReceivableParams) {
    await this.send({ url: `/receivables/${id}/settle`, method: HttpMethod.POST, body: input });
  }
}

export class PayablesHandler extends BaseService implements IPayablesGateway {
  listOpen() {
    return this.send<IPayable[]>({ url: '/payables', method: HttpMethod.GET });
  }

  async create(params: TCreatePayableParams) {
    await this.send({ url: '/payables', method: HttpMethod.POST, body: params });
  }

  async pay(id: string) {
    await this.send({ url: `/payables/${id}/pay`, method: HttpMethod.POST });
  }
}
