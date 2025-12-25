import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { getErrorSanitizer } from './error-sanitizer.util';

/**
 * Códigos de error comunes de PostgreSQL
 * Referencia: https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export const PostgresErrorCode = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  INVALID_TEXT_REPRESENTATION: '22P02',
} as const;

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

/**
 * Maneja errores de base de datos y los convierte en excepciones HTTP apropiadas
 * Similar al manejo explícito de errores en Go
 *
 * @param error - Error capturado de la operación de base de datos
 * @param context - Contexto adicional para el mensaje de error (opcional)
 * @throws HttpException - Excepción HTTP apropiada según el tipo de error
 *
 * @example
 * try {
 *   await this.db.insert(users).values(userData);
 * } catch (error) {
 *   handleDatabaseError(error, 'usuario');
 * }
 */
export function handleDatabaseError(
  error: unknown,
  context?: string,
  configService?: any,
): never {
  const sanitizer = getErrorSanitizer(configService);
  const entityName = context ? ` ${context}` : '';

  // Si ya es una excepción HTTP de NestJS, la relanzamos
  if (
    error instanceof BadRequestException ||
    error instanceof ConflictException ||
    error instanceof NotFoundException ||
    error instanceof InternalServerErrorException
  ) {
    throw error;
  }

  // Verificar si es un error de PostgreSQL
  const pgError = error as PostgresError;

  if (pgError.code) {
    const errorCode = pgError.code;
    if (errorCode === PostgresErrorCode.UNIQUE_VIOLATION) {
      // Sanitizar el nombre de la constraint para evitar exponer información sensible
      const constraint = sanitizer.sanitizeConstraint(pgError.constraint);
      throw new ConflictException(
        `Ya existe un${entityName} con este ${constraint}`,
      );
    }

    if (errorCode === PostgresErrorCode.FOREIGN_KEY_VIOLATION) {
      throw new BadRequestException(
        `Referencia inválida: el registro relacionado no existe`,
      );
    }

    if (errorCode === PostgresErrorCode.NOT_NULL_VIOLATION) {
      // Sanitizar el nombre de la columna
      const column = sanitizer.sanitizeColumn(pgError.column);
      throw new BadRequestException(
        `El campo '${column}' es requerido y no puede ser nulo`,
      );
    }

    if (errorCode === PostgresErrorCode.CHECK_VIOLATION) {
      throw new BadRequestException(
        `Los datos proporcionados no cumplen con las restricciones de validación`,
      );
    }

    if (errorCode === PostgresErrorCode.INVALID_TEXT_REPRESENTATION) {
      throw new BadRequestException(`Formato de datos inválido en la petición`);
    }

    // Error de PostgreSQL no reconocido
    throw new InternalServerErrorException(
      `Error de base de datos al procesar${entityName}`,
    );
  }

  // Si es un Error genérico, verificar el mensaje
  if (error instanceof Error) {
    // Errores comunes de conexión
    if (
      error.message.includes('connection') ||
      error.message.includes('timeout')
    ) {
      throw new InternalServerErrorException(
        `Error de conexión con la base de datos`,
      );
    }

    // Sanitizar el mensaje de error antes de exponerlo
    const sanitizedMessage = sanitizer.sanitizeErrorMessage(error.message);

    // En producción, no exponer mensajes técnicos detallados
    if (sanitizer.shouldShowDetailedErrors()) {
      throw new InternalServerErrorException(
        `Error inesperado al procesar${entityName}: ${sanitizedMessage}`,
      );
    } else {
      throw new InternalServerErrorException(
        `Error inesperado al procesar${entityName}`,
      );
    }
  }

  // Error desconocido
  throw new InternalServerErrorException(
    `Error desconocido al procesar${entityName}`,
  );
}

/**
 * Wrapper para operaciones de base de datos que maneja errores automáticamente
 * Similar a un patrón de manejo de errores en Go
 *
 * @param operation - Función asíncrona que ejecuta la operación de BD
 * @param context - Contexto adicional para el mensaje de error (opcional)
 * @returns Resultado de la operación
 *
 * @example
 * const user = await executeWithErrorHandling(
 *   () => this.db.select().from(users).where(eq(users.id, id)),
 *   'usuario'
 * );
 */
export async function executeWithErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    handleDatabaseError(error, context);
  }
}
