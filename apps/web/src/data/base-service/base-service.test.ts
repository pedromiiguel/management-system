import { describe, expect, it } from 'vite-plus/test';
import { HttpMethod, type HttpResponse, type IHttpClient } from '@shared/http';
import { ConflictError, NotFoundError, UnexpectedError } from '@domain/errors';
import { BaseService } from './base-service';

class Probe extends BaseService {
  get() {
    return this.send<{ ok: boolean }>({ url: '/x', method: HttpMethod.GET });
  }
}

const makeSut = (response: HttpResponse) => {
  const httpClient: IHttpClient = { request: async <R>() => response as HttpResponse<R> };
  return new Probe(httpClient);
};

describe('BaseService', () => {
  it('devolve o corpo em qualquer 2xx', async () => {
    await expect(makeSut({ statusCode: 201, body: { ok: true } }).get()).resolves.toEqual({
      ok: true,
    });
  });

  it('traduz o status no erro de domínio com a mensagem da API', async () => {
    const error = await makeSut({ statusCode: 404, body: { message: 'Venda não encontrada' } })
      .get()
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toMatchObject({
      name: 'NotFoundError',
      status: 404,
      message: 'Venda não encontrada',
    });
  });

  it('junta as mensagens de validação', async () => {
    await expect(
      makeSut({
        statusCode: 409,
        body: { errors: [{ message: 'Nome obrigatório' }, { message: 'SKU repetido' }] },
      }).get(),
    ).rejects.toThrow(new ConflictError(409, 'Nome obrigatório; SKU repetido'));
  });

  it('cai em UnexpectedError sem resposta da API', async () => {
    const error = await makeSut({ statusCode: 0, body: undefined })
      .get()
      .catch((e: unknown) => e);
    expect(error).toBeInstanceOf(UnexpectedError);
    expect(error).toMatchObject({ message: 'Erro inesperado — tente novamente' });
  });
});
