import { Injectable, NotFoundException } from '@nestjs/common';
import { MechanicsRepository } from './repositories/mechanics.repository';
import type { UserResponseDto } from '../users/dto/user-response.dto';
import type { MechanicResponseDto } from './dto/mechanic-response.dto';
import type { PaginatedResponse } from '../../common/dto/pagination.dto';

/**
 * Service para lógica de negocio de mecánicos
 * Usa el repository para acceso a datos
 */
@Injectable()
export class MechanicsService {
  constructor(private readonly mechanicsRepository: MechanicsRepository) {}

  /**
   * Obtiene todos los mecánicos activos (paginado)
   */
  async findAll(
    offset: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    const result = await this.mechanicsRepository.findAllActive(offset, limit);
    return {
      data: result.data.map((m) => this.mapToUserResponse(m)),
      total: result.total,
      offset: result.offset,
      limit: result.limit,
    };
  }

  /**
   * Busca mecánicos por término de búsqueda
   * Nota: Este método no usa paginación, retorna todos los resultados de la búsqueda
   */
  async search(term: string): Promise<UserResponseDto[]> {
    if (!term || term.trim().length === 0) {
      // Si no hay término, retornar todos (sin paginación para búsqueda)
      const result = await this.findAll(0, 1000); // Límite alto para búsqueda
      return result.data;
    }

    const mechanics = await this.mechanicsRepository.findBySearchTerm(term);
    return mechanics.map((m) => this.mapToUserResponse(m));
  }

  /**
   * Obtiene un mecánico por ID
   */
  async findOne(id: string): Promise<UserResponseDto> {
    const mechanic = await this.mechanicsRepository.findById(id);

    if (!mechanic) {
      throw new NotFoundException(`Mecánico con ID ${id} no encontrado`);
    }

    return this.mapToUserResponse(mechanic);
  }

  /**
   * Mapea los datos del repository a UserResponseDto
   */
  private mapToUserResponse(mechanic: MechanicResponseDto): UserResponseDto {
    return {
      id: mechanic.id,
      username: mechanic.username,
      email: mechanic.email,
      firstName: mechanic.firstName || undefined,
      lastName: mechanic.lastName || undefined,
      phone: mechanic.phone || undefined,
      roleId: mechanic.roleId,
      role: mechanic.role
        ? {
            id: mechanic.role.id,
            code: mechanic.role.code,
            name: mechanic.role.name,
          }
        : undefined,
      isActive: mechanic.isActive ?? true,
      lastLogin: mechanic.lastLogin || undefined,
      createdAt: mechanic.createdAt || '',
      updatedAt: mechanic.updatedAt || '',
    };
  }
}
