import {
  Controller,
  Get,
  Post,
  UseGuards,
  Body,
  UsePipes,
  Param,
  Patch,
  Put,
  Query,
  Delete,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientResponseDto } from './dto/client-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { type CreateClientDto, createClientSchema } from './dto/create.dto';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../../common/dto/pagination.dto';
import type { PaginatedResponse } from '../../common/dto/pagination.dto';

@Controller('v1/clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<ClientResponseDto>> {
    // Convertir page a offset: offset = (page - 1) * limit
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.clientsService.findAll(offset, limit);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createClientSchema))
  async create(
    @Body() createClientDto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.create(createClientDto);
  }

  @Put(':id')
  @UsePipes(new ZodValidationPipe(createClientSchema))
  async update(
    @Param('id') id: string,
    @Body() updateClientDto: CreateClientDto,
  ): Promise<ClientResponseDto> {
    return this.clientsService.update(id, updateClientDto);
  }

  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Query('isActive') isActive: boolean,
  ): Promise<void> {
    return this.clientsService.changeStatus(id, isActive);
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<ClientResponseDto> {
    return this.clientsService.findById(id);
  }

  @Get('search')
  async findBySearchTerm(
    @Query('term') term: string,
  ): Promise<ClientResponseDto[]> {
    return this.clientsService.findBySearchTerm(term);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.clientsService.remove(id);
  }

  @Get('count')
  async count(): Promise<number> {
    return this.clientsService.count();
  }
}
