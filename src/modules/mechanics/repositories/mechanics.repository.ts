import { Injectable, Inject } from '@nestjs/common';
import type { Database } from '../../../db/database.module';
import { DATABASE_CONNECTION } from '../../../db/database.module';
import { users, roles } from '../../../db/schema';
import { eq, and, or, inArray, ilike, count } from 'drizzle-orm';
import type { MechanicResponseDto } from '../dto/mechanic-response.dto';
import type { PaginatedResponse } from '../../../common/dto/pagination.dto';

/**
 * Repository para acceso a datos de mecánicos
 * Separa la lógica de acceso a datos de la lógica de negocio
 */
@Injectable()
export class MechanicsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  /**
   * Busca todos los mecánicos activos (paginado)
   */
  async findAllActive(
    offset: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<MechanicResponseDto>> {
    const whereCondition = and(
      or(eq(roles.code, 'MECHANIC'), eq(roles.code, 'MECHANIC_CHIEF')),
      eq(users.isActive, true),
    );

    // Obtener el total de registros
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(whereCondition);
    const total = totalResult?.count ?? 0;

    // Obtener los registros paginados
    const mechanics = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        roleId: users.roleId,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
        },
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    return {
      data: mechanics,
      total,
      offset,
      limit,
    };
  }

  /**
   * Busca mecánicos por término de búsqueda (nombre, apellido, email)
   */
  async findBySearchTerm(term: string): Promise<MechanicResponseDto[]> {
    const likeTerm = `%${term}%`;

    const mechanics = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        roleId: users.roleId,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
        },
      })
      .from(users)
      .innerJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          or(
            ilike(users.firstName, likeTerm),
            ilike(users.lastName, likeTerm),
            ilike(users.email, likeTerm),
          ),
          inArray(roles.code, ['MECHANIC', 'MECHANIC_CHIEF']),
          eq(users.isActive, true),
        ),
      );

    return mechanics;
  }

  /**
   * Busca un mecánico por ID
   */
  async findById(id: string): Promise<MechanicResponseDto | null> {
    const [mechanic] = await this.db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        roleId: users.roleId,
        isActive: users.isActive,
        lastLogin: users.lastLogin,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: {
          id: roles.id,
          code: roles.code,
          name: roles.name,
        },
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .where(
        and(
          eq(users.id, id),
          or(eq(roles.code, 'MECHANIC'), eq(roles.code, 'MECHANIC_CHIEF')),
        ),
      )
      .limit(1);

    return mechanic || null;
  }
}
