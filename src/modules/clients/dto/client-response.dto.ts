export interface ClientResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dui: string;
  isActive: boolean;
  vehicles?: number;
  orders?: number;
  lastVisit?: string | null;
  createdAt: string;
  updatedAt: string;
}
