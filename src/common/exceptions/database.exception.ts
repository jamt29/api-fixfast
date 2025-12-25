import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción personalizada para errores de base de datos
 * Permite un manejo más explícito y controlado de errores de BD
 */
export class DatabaseException extends HttpException {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly constraint?: string,
    public readonly detail?: string,
  ) {
    super(
      {
        message,
        code,
        constraint,
        detail,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
