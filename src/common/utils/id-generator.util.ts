import { nanoid } from 'nanoid';

/**
 * Genera un ID único usando nanoid
 * Por defecto genera IDs de 21 caracteres, que es el tamaño estándar usado en el proyecto
 * @param size Tamaño del ID (por defecto 21)
 * @returns ID único generado
 */
export function generateId(size: number = 21): string {
  return nanoid(size);
}

