/**
 * DTO que representa un mecánico con su rol
 * Usado para tipar los resultados del repository
 */
export interface MechanicResponseDto {
  id: string;
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  roleId: string;
  isActive: boolean | null;
  lastLogin: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  role: {
    id: string;
    code: string;
    name: string;
  } | null;
}
