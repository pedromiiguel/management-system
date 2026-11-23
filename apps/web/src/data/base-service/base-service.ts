import {
  HttpStatusCode,
  type HttpResponse,
  type IHttpClient,
  type HttpRequest,
} from '@shared/http';
import {
  BadRequestError,
  ConflictError,
  type DomainError,
  ForbiddenError,
  NotFoundError,
  UNEXPECTED_ERROR_MESSAGE,
  UnauthorizedError,
  UnexpectedError,
  UnprocessableContentError,
} from '@domain/errors';

type TErrorClass = new (status: number, message: string) => DomainError;

const ERROR_BY_STATUS: Partial<Record<number, TErrorClass>> = {
  [HttpStatusCode.BAD_REQUEST]: BadRequestError,
  [HttpStatusCode.UNAUTHORIZED]: UnauthorizedError,
  [HttpStatusCode.FORBIDDEN]: ForbiddenError,
  [HttpStatusCode.NOT_FOUND]: NotFoundError,
  [HttpStatusCode.CONFLICT]: ConflictError,
  [HttpStatusCode.UNPROCESSABLE_CONTENT]: UnprocessableContentError,
};

/** Corpo de erro da API (filtro de exceções do Nest e ZodValidationPipe). */
type TErrorBody = { message?: string | string[]; errors?: { message: string }[] };

function errorMessage(body: unknown): string {
  const data = (typeof body === 'object' && body !== null ? body : {}) as TErrorBody;
  if (data.errors?.length) return data.errors.map((error) => error.message).join('; ');
  if (Array.isArray(data.message)) return data.message.join('; ');
  if (data.message) return data.message;
  return UNEXPECTED_ERROR_MESSAGE;
}

const isSuccess = (statusCode: number) => statusCode >= 200 && statusCode < 300;

/**
 * Base dos handlers: faz a chamada e traduz status de erro + corpo da API em
 * erro de domínio. Qualquer 2xx devolve o corpo.
 */
export abstract class BaseService {
  constructor(protected readonly httpClient: IHttpClient) {}

  protected async send<R, B = unknown>(request: HttpRequest<B>): Promise<R> {
    const response = await this.httpClient.request<R, B>(request);
    if (isSuccess(response.statusCode)) return response.body;
    throw this.handleError(response);
  }

  protected handleError({ statusCode, body }: HttpResponse): DomainError {
    const ErrorClass = ERROR_BY_STATUS[statusCode] ?? UnexpectedError;
    return new ErrorClass(statusCode, errorMessage(body));
  }
}
