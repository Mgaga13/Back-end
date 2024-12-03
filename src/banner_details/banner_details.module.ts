import { Module } from '@nestjs/common';
import { BannerDetailsService } from './banner_details.service';
import { BannerDetailsController } from './banner_details.controller';
import { BrannersModule } from 'src/branners/branners.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BannerDetailEntity } from './entities/banner_detail.entity';

@Module({
  imports: [BrannersModule, TypeOrmModule.forFeature([BannerDetailEntity])],
  controllers: [BannerDetailsController],
  providers: [BannerDetailsService],
})
export class BannerDetailsModule {}
