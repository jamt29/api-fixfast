import { z } from '../../../common/i18n/zod-i18n.config';

export const loginSchema = z.object({
  email: z.string().email('El email debe ser válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
