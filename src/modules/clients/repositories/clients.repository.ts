import { Injectable, Inject } from '@nestjs/common';
import type { Database } from '../../../db/database.module';
import { DATABASE_CONNECTION } from '../../../db/database.module';
import { clients } from '../../../db/schema';
import { sql } from 'drizzle-orm';
import { ClientResponseDto } from '../dto/client-response.dto';

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
}
