import { z } from '../../../common/i18n/zod-i18n.config';
import { createUserSchema } from './create-user.dto';

export const updateUserSchema = createUserSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateUserDto = z.infer<typeof updateUserSchema>;
