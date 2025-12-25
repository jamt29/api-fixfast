import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { Database } from '../../../db/database.module';
import { DATABASE_CONNECTION } from '../../../db/database.module';
import { clients } from '../../../db/schema';
import { and, or, eq, ilike, sql, count, not } from 'drizzle-orm';
import { ClientResponseDto } from '../dto/client-response.dto';
import { CreateClientDto } from '../dto/create.dto';
import { generateId } from '../../../common/utils/id-generator.util';
import { handleDatabaseError } from '../../../common/utils/database-error.util';

/**
 * Repository para acceso a datos de clientes
 * Separa la lógica de acceso a datos de la lógica de negocio
 */
@Injectable()
export class ClientsRepository {
  constructor(@Inject(DATABASE_CONNECTION) private readonly db: Database) {}

  /**
   * Busca todos los clientes con información adicional:
   * - Conteo de vehículos
   * - Conteo de órdenes de trabajo
   * - Última visita (fecha de la última orden de trabajo)
   */
  async findAll(): Promise<ClientResponseDto[]> {
    const allClients = await this.db
      .select({
        id: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        phone: clients.phone,
        email: clients.email,
        address: clients.address,
        dui: clients.dui,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
        // Subconsulta para contar vehículos
        vehiclesCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM vehicles
          WHERE vehicles.client_id = clients.id
            AND vehicles.is_active = true
        )`.as('vehicles_count'),
        // Subconsulta para contar órdenes de trabajo
        ordersCount: sql<number>`(
          SELECT COUNT(*)::int
          FROM work_orders
          WHERE work_orders.client_id = clients.id
        )`.as('orders_count'),
        // Subconsulta para obtener la última fecha de visita
        lastVisitDate: sql<string | null>`(
          SELECT MAX(work_orders.entry_date)
          FROM work_orders
          WHERE work_orders.client_id = clients.id
        )`.as('last_visit_date'),
      })
      .from(clients);
    //TODO: falta agregar paginacion con offset y limit

    return allClients.map((client) => {
      // Formatear la última visita en formato YYYY-MM-DD
      let lastVisit: string | null = null;
      if (client.lastVisitDate) {
        const date = new Date(client.lastVisitDate);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        lastVisit = `${year}-${month}-${day}`;
      }

      return {
        id: client.id,
        name: `${client.firstName} ${client.lastName}`,
        phone: client.phone ?? '',
        email: client.email ?? '',
        address: client.address ?? '',
        dui: client.dui ?? '',
        isActive: client.isActive ?? false,
        vehicles: client.vehiclesCount ?? 0,
        orders: client.ordersCount ?? 0,
        lastVisit: lastVisit,
        createdAt: client.createdAt ?? '',
        updatedAt: client.updatedAt ?? '',
      };
    });
  }

  async findById(id: string): Promise<ClientResponseDto> {
    const [client] = await this.db
      .select({
        id: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        phone: clients.phone,
        email: clients.email,
        address: clients.address,
        dui: clients.dui,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
      .where(eq(clients.id, id))
      .limit(1);

    if (!client) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return {
      id: client.id,
      name: `${client.firstName} ${client.lastName}`,
      phone: client.phone ?? '',
      email: client.email ?? '',
      address: client.address ?? '',
      dui: client.dui ?? '',
      isActive: client.isActive ?? false,
      createdAt: client.createdAt ?? '',
      updatedAt: client.updatedAt ?? '',
    };
  }

  async create(client: CreateClientDto): Promise<ClientResponseDto> {
    try {
      // Verificar duplicados antes de insertar (validación explícita)
      const existingClient = await this.db
        .select()
        .from(clients)
        .where(or(eq(clients.email, client.email), eq(clients.dui, client.dui)))
        .limit(1);

      if (existingClient.length > 0) {
        if (existingClient[0].email === client.email) {
          throw new ConflictException('El email ya está en uso');
        }
        if (existingClient[0].dui === client.dui) {
          throw new ConflictException('El DUI ya está en uso');
        }
      }

      const [newClient] = await this.db
        .insert(clients)
        .values({
          id: generateId(),
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone,
          email: client.email,
          address: client.address,
          dui: client.dui,
          isActive: client.isActive ?? true,
        })
        .returning();

      return {
        id: newClient.id,
        name: `${newClient.firstName} ${newClient.lastName}`,
        phone: newClient.phone ?? '',
        email: newClient.email ?? '',
        address: newClient.address ?? '',
        dui: newClient.dui ?? '',
        isActive: newClient.isActive ?? false,
        vehicles: 0,
        orders: 0,
        lastVisit: null,
        createdAt: newClient.createdAt ?? '',
        updatedAt: newClient.updatedAt ?? '',
      };
    } catch (error) {
      // Manejo explícito de errores de base de datos
      handleDatabaseError(error, 'cliente');
    }
  }

  async update(
    id: string,
    client: CreateClientDto,
  ): Promise<ClientResponseDto> {
    try {
      // Verificar que el cliente existe
      await this.findById(id);

      // Verificar duplicados (excluyendo el cliente actual)
      const isDuiInUse = await this.db
        .select()
        .from(clients)
        .where(and(eq(clients.dui, client.dui), not(eq(clients.id, id))))
        .limit(1);

      if (isDuiInUse.length > 0) {
        throw new ConflictException('El DUI ya está en uso');
      }

      const isEmailInUse = await this.db
        .select()
        .from(clients)
        .where(and(eq(clients.email, client.email), not(eq(clients.id, id))))
        .limit(1);

      if (isEmailInUse.length > 0) {
        throw new ConflictException('El email ya está en uso');
      }

      await this.db
        .update(clients)
        .set({
          ...client,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(clients.id, id));

      const updatedClient = await this.findById(id);
      return updatedClient;
    } catch (error) {
      // Manejo explícito de errores de base de datos
      handleDatabaseError(error, 'cliente');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      // Verificar que existe antes de eliminar
      await this.findById(id);
      await this.db.delete(clients).where(eq(clients.id, id));
    } catch (error) {
      handleDatabaseError(error, 'cliente');
    }
  }

  async findBySearchTerm(term: string): Promise<ClientResponseDto[]> {
    const likeTerm = `%${term}%`;
    const clientes = await this.db
      .select({
        id: clients.id,
        firstName: clients.firstName,
        lastName: clients.lastName,
        phone: clients.phone,
        email: clients.email,
        address: clients.address,
        dui: clients.dui,
        isActive: clients.isActive,
        createdAt: clients.createdAt,
        updatedAt: clients.updatedAt,
      })
      .from(clients)
      .where(
        and(
          or(
            ilike(clients.firstName, likeTerm),
            ilike(clients.lastName, likeTerm),
            ilike(clients.email, likeTerm),
          ),
        ),
      )
      .limit(10);
    return clientes.map((cliente) => {
      return {
        id: cliente.id,
        name: `${cliente.firstName} ${cliente.lastName}`,
        phone: cliente.phone ?? '',
        email: cliente.email ?? '',
        address: cliente.address ?? '',
        dui: cliente.dui ?? '',
        isActive: cliente.isActive ?? false,
        createdAt: cliente.createdAt ?? '',
        updatedAt: cliente.updatedAt ?? '',
      };
    });
  }

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    try {
      // Verificar que existe antes de actualizar
      await this.findById(id);
      await this.db.update(clients).set({ isActive }).where(eq(clients.id, id));
    } catch (error) {
      handleDatabaseError(error, 'cliente');
    }
  }

  async count(): Promise<number> {
    const result = await this.db.select({ count: count() }).from(clients);
    return result[0]?.count ?? 0;
  }
}
