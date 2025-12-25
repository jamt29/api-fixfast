import { ConfigService } from '@nestjs/config';

/**
 * Mapeo seguro de constraints de PostgreSQL a mensajes genéricos
 * Evita exponer nombres reales de constraints y columnas en producción
 */
const CONSTRAINT_MESSAGES: Record<string, string> = {
  // Constraints comunes de email
  'clients_email_unique': 'email',
  'users_email_unique': 'email',
  'users_username_unique': 'nombre de usuario',
  // Constraints comunes de DUI
  'clients_dui_unique': 'DUI',
  // Constraints genéricos
  'unique': 'valor único',
  'primary': 'identificador',
};

/**
 * Mapeo seguro de nombres de columnas a mensajes genéricos
 * Evita exponer nombres reales de columnas en producción
 */
const COLUMN_MESSAGES: Record<string, string> = {
  'email': 'email',
  'username': 'nombre de usuario',
  'dui': 'DUI',
  'phone': 'teléfono',
  'password': 'contraseña',
  'role_id': 'rol',
  'client_id': 'cliente',
  'user_id': 'usuario',
};

/**
 * Sanitiza mensajes de error para evitar exponer información sensible
 * En producción, solo muestra mensajes genéricos
 * En desarrollo, puede mostrar más detalles si está habilitado
 */
export class ErrorSanitizer {
  private readonly isProduction: boolean;
  private readonly showDetailedErrors: boolean;

  constructor(configService?: ConfigService) {
    this.isProduction = configService?.get('NODE_ENV') === 'production';
    this.showDetailedErrors =
      configService?.get('SHOW_DETAILED_ERRORS') === 'true' ||
      !this.isProduction;
  }

  /**
   * Sanitiza el nombre de una constraint
   * En producción, retorna un mensaje genérico
   */
  sanitizeConstraint(constraint?: string): string {
    if (!constraint) {
      return 'campo único';
    }

    // En producción, usar mensajes genéricos
    if (this.isProduction && !this.showDetailedErrors) {
      // Intentar encontrar un mensaje genérico para esta constraint
      const genericMessage = CONSTRAINT_MESSAGES[constraint.toLowerCase()];
      if (genericMessage) {
        return genericMessage;
      }

      // Si no hay mapeo, extraer información genérica del nombre
      // Ejemplo: "clients_email_unique" -> "email"
      const parts = constraint.toLowerCase().split('_');
      if (parts.length >= 2) {
        const fieldName = parts[parts.length - 2]; // Segundo desde el final
        return COLUMN_MESSAGES[fieldName] || 'campo único';
      }

      return 'campo único';
    }

    // En desarrollo, mostrar el nombre real (puede ser útil para debugging)
    return constraint;
  }

  /**
   * Sanitiza el nombre de una columna
   * En producción, retorna un mensaje genérico
   */
  sanitizeColumn(column?: string): string {
    if (!column) {
      return 'campo';
    }

    // En producción, usar mensajes genéricos
    if (this.isProduction && !this.showDetailedErrors) {
      return COLUMN_MESSAGES[column.toLowerCase()] || 'campo';
    }

    // En desarrollo, mostrar el nombre real
    return column;
  }

  /**
   * Sanitiza un mensaje de error completo
   * Elimina información sensible como stack traces, rutas de archivos, etc.
   */
  sanitizeErrorMessage(message: string): string {
    // En producción, no mostrar mensajes técnicos
    if (this.isProduction && !this.showDetailedErrors) {
      // Eliminar rutas de archivos
      message = message.replace(/\/[^\s]+\.(ts|js):\d+:\d+/g, '');
      // Eliminar stack traces
      message = message.split('\n')[0];
      // Eliminar referencias a módulos internos
      message = message.replace(/at\s+\w+\.\w+/g, '');
    }

    return message.trim();
  }

  /**
   * Verifica si se deben mostrar errores detallados
   */
  shouldShowDetailedErrors(): boolean {
    return this.showDetailedErrors;
  }
}

/**
 * Instancia singleton del sanitizador
 * Se inicializa con ConfigService si está disponible
 */
let sanitizerInstance: ErrorSanitizer | null = null;

/**
 * Obtiene o crea la instancia del sanitizador
 */
export function getErrorSanitizer(configService?: ConfigService): ErrorSanitizer {
  if (!sanitizerInstance) {
    sanitizerInstance = new ErrorSanitizer(configService);
  }
  return sanitizerInstance;
}

