import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBrannerDto } from './dto/create-branner.dto';
import { UpdateBrannerDto } from './dto/update-branner.dto';
import { BrannerEntity } from './entities/branner.entity';
import { DataSource, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { PageBannerDto } from './dto/page-branner.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';
import { PageDto } from 'src/commom/dto/page.dto';

@Injectable()
export class BrannersService {
  private bannerRepository: Repository<BrannerEntity>;
  constructor(private datasource: DataSource) {
    this.bannerRepository = this.datasource.getRepository(BrannerEntity);
  }
  async create(createCategoryDto: CreateBrannerDto) {
    return await this.bannerRepository.save(createCategoryDto);
  }

  async findAll(options: PageBannerDto) {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.bannerRepository.createQueryBuilder('banner');

    queryBuilder.select(['banner.id', 'banner.image', 'banner.isDeleted']);
    if (options.searchText) {
      queryBuilder.andWhere('banner.title LIKE :searchText', {
        searchText: `%${options.searchText}%`, // Adding % for LIKE pattern matching
      });
    }
    queryBuilder
      .andWhere('banner.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy(`banner.${options.sort}`, options.order)
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

    return new PageDto<BrannerEntity>(entities, pageMetaDto);
  }

  async findOne(id: string) {
    const banner = await this.bannerRepository.findOne({
      where: { id: id },
    });
    if (!banner) {
      throw new Error(`Category with ID ${id} not found`);
    }
    return banner;
  }

  async update(id: string, updateCategoryDto: UpdateBrannerDto) {
    const banner = await this.findOne(id);
    return this.bannerRepository.save({
      ...banner,
      ...updateCategoryDto,
    });
  }

  async remove(id: string) {
    const banner = await this.findOne(id);
    return this.bannerRepository.save({
      ...banner,
      isDeleted: true,
    });
  }
}
