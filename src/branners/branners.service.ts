import { Injectable } from '@nestjs/common';
import { CreateBrannerDto } from './dto/create-branner.dto';
import { UpdateBrannerDto } from './dto/update-branner.dto';
import { BrannerEntity } from './entities/branner.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class BrannersService {
  private bannerRepository: Repository<BrannerEntity>;
  constructor(private datasource: DataSource) {
    this.bannerRepository = this.datasource.getRepository(BrannerEntity);
  }
  async create(createCategoryDto: CreateBrannerDto) {
    return await this.bannerRepository.save(createCategoryDto);
  }

  async findAll() {
    return await this.bannerRepository.find();
  }

  async findOne(id: string) {
    const category = await this.bannerRepository.findOne({
      where: { id: id },
    });
    if (!category) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateBrannerDto) {
    const category = await this.findOne(id);
    return this.bannerRepository.save({
      ...category,
      ...updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.bannerRepository.save({
      ...category,
      isDeleted: true,
    });
  }
}
