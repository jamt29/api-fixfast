import { z } from '../i18n/zod-i18n.config';

/**
 * Schema para validar parámetros de paginación
 */
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 1;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 1 : parsed;
    })
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return 10;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 10 : parsed;
    })
    .pipe(z.number().int().min(1).max(100)),
});

export type PaginationQueryDto = {
  page: number;
  limit: number;
};

/**
 * Interfaz para respuestas paginadas
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  offset: number;
  limit: number;
}
