import { Test, TestingModule } from '@nestjs/testing';
import { MechanicsController } from './mechanics.controller';

describe('MechanicsController', () => {
  let controller: MechanicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MechanicsController],
    }).compile();

    controller = module.get<MechanicsController>(MechanicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
