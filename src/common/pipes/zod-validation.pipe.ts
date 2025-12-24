import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';
// Importar configuración de i18n - debe ejecutarse antes de usar zod
import '../i18n/zod-i18n.config';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: unknown) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        // Usar el primer error traducido
        const firstError = error.issues[0];
        const message = firstError?.message || 'Error de validación';
        throw new BadRequestException(message);
      }
      throw new BadRequestException('Error de validación');
    }
  }
}
