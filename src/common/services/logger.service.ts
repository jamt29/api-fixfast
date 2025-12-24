import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

/**
 * Servicio de logging personalizado
 * Similar a zap o logrus de Go
 * 
 * Uso:
 * constructor(private readonly logger: LoggerService) {}
 * this.logger.info('Mensaje', { contexto: 'valor' });
 */
@Injectable()
export class LoggerService {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext('LoggerService');
  }

  /**
   * Log de nivel debug - información detallada para debugging
   */
  debug(message: string, context?: Record<string, any>): void {
    this.logger.debug(context || {}, message);
  }

  /**
   * Log de nivel info - información general
   */
  info(message: string, context?: Record<string, any>): void {
    this.logger.info(context || {}, message);
  }

  /**
   * Log de nivel warn - advertencias
   */
  warn(message: string, context?: Record<string, any>): void {
    this.logger.warn(context || {}, message);
  }

  /**
   * Log de nivel error - errores
   */
  error(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error,
    };
    this.logger.error(errorContext, message);
  }

  /**
   * Log de nivel fatal - errores críticos
   */
  fatal(message: string, error?: Error | any, context?: Record<string, any>): void {
    const errorContext = {
      ...context,
      error: error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : error,
    };
    this.logger.fatal(errorContext, message);
  }

  /**
   * Establece el contexto del logger (útil para identificar el módulo/servicio)
   */
  setContext(context: string): void {
    this.logger.setContext(context);
  }
}

