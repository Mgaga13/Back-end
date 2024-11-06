import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BannerDetailsService } from './banner_details.service';
import { CreateBannerDetailDto } from './dto/create-banner_detail.dto';
import { UpdateBannerDetailDto } from './dto/update-banner_detail.dto';

@Controller('banner-details')
export class BannerDetailsController {
  constructor(private readonly bannerDetailsService: BannerDetailsService) {}

  @Post()
  create(@Body() createBannerDetailDto: CreateBannerDetailDto) {
    return this.bannerDetailsService.create(createBannerDetailDto);
  }

  @Get()
  findAll() {
    return this.bannerDetailsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannerDetailsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBannerDetailDto: UpdateBannerDetailDto) {
    return this.bannerDetailsService.update(+id, updateBannerDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannerDetailsService.remove(+id);
  }
}
