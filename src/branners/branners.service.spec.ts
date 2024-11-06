import { Test, TestingModule } from '@nestjs/testing';
import { BrannersService } from './branners.service';

describe('BrannersService', () => {
  let service: BrannersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BrannersService],
    }).compile();

    service = module.get<BrannersService>(BrannersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
