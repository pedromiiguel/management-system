import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/** Erros conhecidos do Prisma viram respostas HTTP legíveis em pt-BR. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const reply = (status: HttpStatus, message: string) =>
      response.status(status).json({ statusCode: status, message });

    switch (exception.code) {
      case 'P2002': {
        const fields =
          (exception.meta?.target as string[] | undefined)?.join(', ') ?? 'campo único';
        return reply(HttpStatus.CONFLICT, `Já existe um registro com o mesmo valor de: ${fields}`);
      }
      case 'P2003':
        return reply(
          HttpStatus.CONFLICT,
          'Registro em uso por outros dados — não pode ser alterado',
        );
      case 'P2025':
        return reply(HttpStatus.NOT_FOUND, 'Registro não encontrado');
      default:
        this.logger.error(`Erro do Prisma ${exception.code}: ${exception.message}`);
        return reply(HttpStatus.INTERNAL_SERVER_ERROR, 'Erro interno ao acessar o banco de dados');
    }
  }
}
