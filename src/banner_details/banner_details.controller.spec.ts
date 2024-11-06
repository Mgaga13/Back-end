import { Test, TestingModule } from '@nestjs/testing';
import { BannerDetailsController } from './banner_details.controller';
import { BannerDetailsService } from './banner_details.service';

describe('BannerDetailsController', () => {
  let controller: BannerDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BannerDetailsController],
      providers: [BannerDetailsService],
    }).compile();

    controller = module.get<BannerDetailsController>(BannerDetailsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
