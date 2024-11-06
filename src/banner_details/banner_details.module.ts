import { Module } from '@nestjs/common';
import { BannerDetailsService } from './banner_details.service';
import { BannerDetailsController } from './banner_details.controller';

@Module({
  controllers: [BannerDetailsController],
  providers: [BannerDetailsService],
})
export class BannerDetailsModule {}
