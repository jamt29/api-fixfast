import { z } from '../../../common/i18n/zod-i18n.config';

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(100, 'El nombre de usuario debe tener máximo 100 caracteres'),
  email: z
    .string()
    .email('El email debe ser válido')
    .max(100, 'El email debe tener máximo 100 caracteres'),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(255, 'La contraseña debe tener máximo 255 caracteres'),
  firstName: z
    .string()
    .max(100, 'El nombre debe tener máximo 100 caracteres')
    .optional(),
  lastName: z
    .string()
    .max(100, 'El apellido debe tener máximo 100 caracteres')
    .optional(),
  phone: z
    .string()
    .max(15, 'El teléfono debe tener máximo 15 caracteres')
    .optional(),
  roleId: z.string(),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
