import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBannerDetailDto } from './dto/create-banner_detail.dto';
import { UpdateBannerDetailDto } from './dto/update-banner_detail.dto';
import { BannerDetailEntity } from './entities/banner_detail.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BannerDetailsService {
  constructor(
    @InjectRepository(BannerDetailEntity)
    private readonly bannerDetailRepository: Repository<BannerDetailEntity>,
  ) {}

  // Create a new banner detail
  async create(
    createBannerDetailDto: CreateBannerDetailDto,
  ): Promise<BannerDetailEntity> {
    const bannerDetail = this.bannerDetailRepository.create(
      createBannerDetailDto,
    );
    return await this.bannerDetailRepository.save(bannerDetail);
  }

  // Find all banner details
  async findAll(): Promise<BannerDetailEntity[]> {
    return await this.bannerDetailRepository.find({
      relations: ['product', 'banner'],
    });
  }

  // Find one banner detail by ID
  async findOne(id: string): Promise<BannerDetailEntity> {
    const bannerDetail = await this.bannerDetailRepository.findOne({
      where: { id },
      relations: ['product', 'banner'],
    });
    if (!bannerDetail)
      throw new NotFoundException(`BannerDetail with ID ${id} not found`);
    return bannerDetail;
  }

  // Update a banner detail
  async update(
    id: string,
    updateBannerDetailDto: UpdateBannerDetailDto,
  ): Promise<BannerDetailEntity> {
    await this.bannerDetailRepository.update(id, updateBannerDetailDto);
    const updatedBannerDetail = await this.findOne(id);
    return updatedBannerDetail;
  }

  // Remove a banner detail by ID
  async remove(id: number): Promise<void> {
    const deleteResult = await this.bannerDetailRepository.delete(id);
    if (!deleteResult.affected)
      throw new NotFoundException(`BannerDetail with ID ${id} not found`);
  }
}
