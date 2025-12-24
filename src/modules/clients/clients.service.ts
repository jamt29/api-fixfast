import { Injectable } from '@nestjs/common';
import { ClientsRepository } from './repositories/clients.repository';
import { ClientResponseDto } from './dto/client-response.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  async findAll(): Promise<ClientResponseDto[]> {
    const clients = await this.clientsRepository.findAll();
    return clients.map((client) => this.mapToClientResponse(client));
  }

  private mapToClientResponse(client: ClientResponseDto): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address,
      dui: client.dui,
      isActive: client.isActive,
      vehicles: client.vehicles,
      orders: client.orders,
      lastVisit: client.lastVisit,
      createdAt: client.createdAt,
      updatedAt: client.updatedAt,
    };
  }
}
