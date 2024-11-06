import { Test, TestingModule } from '@nestjs/testing';
import { BannerDetailsService } from './banner_details.service';

describe('BannerDetailsService', () => {
  let service: BannerDetailsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BannerDetailsService],
    }).compile();

    service = module.get<BannerDetailsService>(BannerDetailsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
