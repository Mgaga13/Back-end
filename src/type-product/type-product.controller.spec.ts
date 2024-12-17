import { Test, TestingModule } from '@nestjs/testing';
import { TypeProductController } from './type-product.controller';
import { TypeProductService } from './type-product.service';

describe('TypeProductController', () => {
  let controller: TypeProductController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TypeProductController],
      providers: [TypeProductService],
    }).compile();

    controller = module.get<TypeProductController>(TypeProductController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
