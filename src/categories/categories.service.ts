import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { DataSource, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { PageDto } from 'src/commom/dto/page.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';

@Injectable()
export class CategoriesService {
  private categoryRepository: Repository<CategoryEntity>;
  constructor(private datasource: DataSource) {
    this.categoryRepository = this.datasource.getRepository(CategoryEntity);
  }
  async create(createCategoryDto: CreateCategoryDto) {
    const categoryExists = await this.findByName(createCategoryDto.name);
    if (categoryExists) {
      throw new HttpException('name is exists', HttpStatus.CONFLICT);
    }
    return await this.categoryRepository.save(createCategoryDto);
  }

  async findAll(options: PageOptionsDto) {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    queryBuilder
      .where('category.isDeleted = :isDeleted', { isDeleted: false })
      .select(['category.id', 'category.name', 'category.isDeleted']);
    queryBuilder
      .orderBy(`category.${options.sort}`, options.order)
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

    return new PageDto<CategoryEntity>(entities, pageMetaDto);
  }

  async findByName(name: string) {
    const category = await this.categoryRepository.findOne({
      where: { name: name },
    });
    return category;
  }

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id: id },
    });
    if (!category) {
      throw new HttpException('Not found category', HttpStatus.BAD_REQUEST);
    }
    return category;
  }

  async update(updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(updateCategoryDto.id);
    return this.categoryRepository.save({
      ...category,
      ...updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.categoryRepository.save({
      ...category,
      isDeleted: true,
    });
  }
}
