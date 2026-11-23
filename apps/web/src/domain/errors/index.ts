/**
 * Erros de domínio, um por status HTTP que a UI trata de forma diferente.
 * O `name` é o que a apresentação usa para decidir o tratamento; `status`
 * fica para a política de retry do cache.
 */
export class DomainError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class BadRequestError extends DomainError {}
export class UnauthorizedError extends DomainError {}
export class ForbiddenError extends DomainError {}
export class NotFoundError extends DomainError {}
export class ConflictError extends DomainError {}
export class UnprocessableContentError extends DomainError {}
export class UnexpectedError extends DomainError {}

export const UNEXPECTED_ERROR_MESSAGE = 'Erro inesperado — tente novamente';
