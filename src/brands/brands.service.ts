import {
  BadRequestException,
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
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';
import { PageDto } from 'src/commom/dto/page.dto';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';

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

  async findAll(options: PageOptionsDto) {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.brandRepository.createQueryBuilder('brand');

    queryBuilder
      .where('brand.isDeleted = :isDeleted', { isDeleted: false })
      .select(['brand.id', 'brand.name', 'brand.isDeleted']);
    queryBuilder
      .orderBy(`brand.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit)
      .getMany();
    const itemCount: number = await queryBuilder.getCount();

    const { entities } = await queryBuilder
      .getRawAndEntities()
      .catch((error: any) => {
        throw new BadRequestException(error);
      });

    const pageMetaDto: PageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: options,
    });

    return new PageDto<BrandEntity>(entities, pageMetaDto);
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
