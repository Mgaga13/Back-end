import { Test, TestingModule } from '@nestjs/testing';
import { BrannersController } from './branners.controller';
import { BrannersService } from './branners.service';

describe('BrannersController', () => {
  let controller: BrannersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrannersController],
      providers: [BrannersService],
    }).compile();

    controller = module.get<BrannersController>(BrannersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
