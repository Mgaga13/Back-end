import { Injectable } from '@nestjs/common';
import { CreateBannerDetailDto } from './dto/create-banner_detail.dto';
import { UpdateBannerDetailDto } from './dto/update-banner_detail.dto';

@Injectable()
export class BannerDetailsService {
  create(createBannerDetailDto: CreateBannerDetailDto) {
    return 'This action adds a new bannerDetail';
  }

  findAll() {
    return `This action returns all bannerDetails`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bannerDetail`;
  }

  update(id: number, updateBannerDetailDto: UpdateBannerDetailDto) {
    return `This action updates a #${id} bannerDetail`;
  }

  remove(id: number) {
    return `This action removes a #${id} bannerDetail`;
  }
}
