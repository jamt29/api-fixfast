import { Injectable } from '@nestjs/common';
import { ClientsRepository } from './repositories/clients.repository';
import { ClientResponseDto } from './dto/client-response.dto';
import { CreateClientDto } from './dto/create.dto';
import type { PaginatedResponse } from '../../common/dto/pagination.dto';

@Injectable()
export class ClientsService {
  constructor(private readonly clientsRepository: ClientsRepository) {}

  async findAll(
    offset: number = 0,
    limit: number = 10,
  ): Promise<PaginatedResponse<ClientResponseDto>> {
    const result = await this.clientsRepository.findAll(offset, limit);
    return {
      data: result.data.map((client) => this.mapToClientResponse(client)),
      total: result.total,
      offset: result.offset,
      limit: result.limit,
    };
  }

  async create(createClientDto: CreateClientDto): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.create(createClientDto);
    return this.mapToClientResponse(client);
  }

  async update(
    id: string,
    updateClientDto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.update(id, updateClientDto);
    return this.mapToClientResponse(client);
  }

  async changeStatus(id: string, isActive: boolean): Promise<void> {
    await this.clientsRepository.changeStatus(id, isActive);
    return;
  }

  async findById(id: string): Promise<ClientResponseDto> {
    const client = await this.clientsRepository.findById(id);
    return this.mapToClientResponse(client);
  }

  async findBySearchTerm(term: string): Promise<ClientResponseDto[]> {
    const clients = await this.clientsRepository.findBySearchTerm(term);
    return clients.map((client) => this.mapToClientResponse(client));
  }

  async count(): Promise<number> {
    return await this.clientsRepository.count();
  }
  async remove(id: string): Promise<void> {
    await this.clientsRepository.remove(id);
    return;
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
