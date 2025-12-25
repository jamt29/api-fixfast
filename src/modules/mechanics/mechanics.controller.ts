import { Controller, Get, Param, Query, UseGuards, UsePipes } from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import {
  paginationQuerySchema,
  type PaginationQueryDto,
} from '../../common/dto/pagination.dto';
import type { PaginatedResponse } from '../../common/dto/pagination.dto';

@Controller('v1/mechanics')
@UseGuards(JwtAuthGuard)
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  /**
   * Obtiene todos los mecánicos activos (paginado)
   */
  @Get()
  @UsePipes(new ZodValidationPipe(paginationQuerySchema))
  async findAll(
    @Query() query: PaginationQueryDto,
  ): Promise<PaginatedResponse<UserResponseDto>> {
    // Convertir page a offset: offset = (page - 1) * limit
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;
    return this.mechanicsService.findAll(offset, limit);
  }

  /**
   * Busca mecánicos por término (nombre, apellido, email)
   */
  @Get('search')
  async search(@Query('term') term: string): Promise<UserResponseDto[]> {
    return this.mechanicsService.search(term);
  }

  /**
   * Obtiene un mecánico por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.mechanicsService.findOne(id);
  }
}
