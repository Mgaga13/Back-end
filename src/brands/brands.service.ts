import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { BrandEntity } from './entities/brand.entity';
import { Repository } from 'typeorm';

@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(BrandEntity)
    private readonly brandRepository: Repository<BrandEntity>,
  ) {}

  async create(createBrandDto: CreateBrandDto): Promise<BrandEntity> {
    await this.findByName(createBrandDto.name);
    const brand = this.brandRepository.create(createBrandDto);
    return await this.brandRepository.save(brand);
  }

  async findAll(): Promise<BrandEntity[]> {
    return await this.brandRepository.find();
  }
  async findByName(name: string) {
    const verifyExistsName = await this.brandRepository.findOne({
      where: { name: name },
    });
    if (verifyExistsName) {
      throw new HttpException(`${name} is exits brand`, HttpStatus.CONFLICT);
    }
  }

  async findOne(id: string): Promise<BrandEntity> {
    const brand = await this.brandRepository.findOne({ where: { id } });
    if (!brand) throw new NotFoundException(`Brand with ID ${id} not found`);
    return brand;
  }

  async update(
    id: string,
    updateBrandDto: UpdateBrandDto,
  ): Promise<BrandEntity> {
    await this.brandRepository.update(id, updateBrandDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deleteResult = await this.brandRepository.delete(id);
    if (!deleteResult.affected)
      throw new NotFoundException(`Brand with ID ${id} not found`);
  }
}
