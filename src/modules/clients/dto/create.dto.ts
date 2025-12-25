import { z } from '../../../common/i18n/zod-i18n.config';

export const createClientSchema = z.object({
  firstName: z.string().min(1, 'El nombre es requerido'),
  lastName: z.string().min(1, 'El apellido es requerido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  email: z.email('El email debe ser válido'),
  address: z.string().min(1, 'La dirección es requerida'),
  dui: z.string().min(1, 'El DUI es requerido'),
  isActive: z.boolean().default(true),
});

export type CreateClientDto = z.infer<typeof createClientSchema>;
