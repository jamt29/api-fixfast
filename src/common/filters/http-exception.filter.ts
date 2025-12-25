import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DatabaseException } from '../exceptions/database.exception';
import { PostgresErrorCode } from '../utils/database-error.util';
import { getErrorSanitizer } from '../utils/error-sanitizer.util';

/**
 * Interfaz para errores de PostgreSQL
 */
interface PostgresError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  column?: string;
  table?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);
  private sanitizer = getErrorSanitizer();

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Intentar obtener ConfigService del request (si está disponible)
    const configService = request.app?.get?.(ConfigService);
    if (configService) {
      // Recrear sanitizer con ConfigService si está disponible
      this.sanitizer = getErrorSanitizer(configService);
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    // Manejar excepciones HTTP de NestJS
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = (exceptionResponse as any).message;
        message = Array.isArray(msg) ? msg[0] : msg;
      }
    }
    // Manejar excepciones personalizadas de base de datos
    else if (exception instanceof DatabaseException) {
      status = exception.getStatus();
      message = exception.message;
      // Log del error de BD para debugging
      this.logger.error(
        `Database error: ${exception.code} - ${exception.constraint}`,
        exception.stack,
      );
    }
    // Manejar errores de PostgreSQL directamente (si no fueron capturados antes)
    else if (this.isPostgresError(exception)) {
      const pgError = exception as PostgresError;
      status = this.getHttpStatusFromPostgresError(pgError);
      message = this.getMessageFromPostgresError(pgError);
      // Log del error de BD
      this.logger.error(
        `PostgreSQL error: ${pgError.code} - ${pgError.message}`,
        pgError.stack,
      );
    }
    // Manejar errores genéricos
    else if (exception instanceof Error) {
      // Sanitizar el mensaje antes de enviarlo al cliente
      message = this.sanitizer.sanitizeErrorMessage(exception.message);

      // En producción, no exponer mensajes técnicos detallados
      if (
        !this.sanitizer.shouldShowDetailedErrors() &&
        status === HttpStatus.INTERNAL_SERVER_ERROR
      ) {
        message = 'Error interno del servidor';
      }

      // Log completo del error (solo en servidor, nunca se expone al cliente)
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      message,
    });
  }

  /**
   * Verifica si un error es un error de PostgreSQL
   */
  private isPostgresError(error: unknown): boolean {
    if (!(error instanceof Error)) {
      return false;
    }
    const pgError = error as PostgresError;
    return (
      !!pgError.code &&
      (pgError.code.startsWith('23') || pgError.code.startsWith('22'))
    );
  }

  /**
   * Convierte un código de error de PostgreSQL a un código HTTP
   */
  private getHttpStatusFromPostgresError(error: PostgresError): HttpStatus {
    switch (error.code) {
      case PostgresErrorCode.UNIQUE_VIOLATION:
        return HttpStatus.CONFLICT;
      case PostgresErrorCode.FOREIGN_KEY_VIOLATION:
      case PostgresErrorCode.NOT_NULL_VIOLATION:
      case PostgresErrorCode.CHECK_VIOLATION:
      case PostgresErrorCode.INVALID_TEXT_REPRESENTATION:
        return HttpStatus.BAD_REQUEST;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }

  /**
   * Genera un mensaje de error legible a partir de un error de PostgreSQL
   * Sanitiza la información para evitar exponer detalles sensibles
   */
  private getMessageFromPostgresError(error: PostgresError): string {
    switch (error.code) {
      case PostgresErrorCode.UNIQUE_VIOLATION: {
        // Sanitizar el nombre de la constraint
        const constraint = this.sanitizer.sanitizeConstraint(error.constraint);
        return `Ya existe un registro con este ${constraint}`;
      }
      case PostgresErrorCode.FOREIGN_KEY_VIOLATION:
        return 'Referencia inválida: el registro relacionado no existe';
      case PostgresErrorCode.NOT_NULL_VIOLATION: {
        // Sanitizar el nombre de la columna
        const column = this.sanitizer.sanitizeColumn(error.column);
        return `El campo '${column}' es requerido y no puede ser nulo`;
      }
      case PostgresErrorCode.CHECK_VIOLATION:
        return 'Los datos proporcionados no cumplen con las restricciones de validación';
      case PostgresErrorCode.INVALID_TEXT_REPRESENTATION:
        return 'Formato de datos inválido en la petición';
      default:
        return 'Error de base de datos';
    }
  }
}
