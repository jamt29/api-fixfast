import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MechanicsService } from './mechanics.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('v1/mechanics')
@UseGuards(JwtAuthGuard)
export class MechanicsController {
  constructor(private readonly mechanicsService: MechanicsService) {}

  /**
   * Obtiene todos los mecánicos activos
   */
  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.mechanicsService.findAll();
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
