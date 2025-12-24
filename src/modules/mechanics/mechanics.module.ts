import { Module } from '@nestjs/common';
import { MechanicsController } from './mechanics.controller';
import { MechanicsService } from './mechanics.service';
import { MechanicsRepository } from './repositories/mechanics.repository';
import { DatabaseModule } from '../../db/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [MechanicsController],
  providers: [MechanicsService, MechanicsRepository],
  exports: [MechanicsService],
})
export class MechanicsModule {}
