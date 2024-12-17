import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateTypeProductDto } from './dto/create-type-product.dto';
import { UpdateTypeProductDto } from './dto/update-type-product.dto';
import { TypeEntity } from './entities/type-product.entity';
import { DataSource, Repository } from 'typeorm';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';
import { PageDto } from 'src/commom/dto/page.dto';

@Injectable()
export class TypeProductService {
  private typeRepository: Repository<TypeEntity>;
  constructor(private datasource: DataSource) {
    this.typeRepository = this.datasource.getRepository(TypeEntity);
  }
  async create(createCategoryDto: CreateTypeProductDto) {
    const categoryExists = await this.findByName(createCategoryDto.name);
    if (categoryExists) {
      throw new HttpException('name is exists', HttpStatus.CONFLICT);
    }
    return await this.typeRepository.save(createCategoryDto);
  }

  async findAll(options: PageOptionsDto) {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.typeRepository.createQueryBuilder('type');

    queryBuilder
      .where('type.isDeleted = :isDeleted', { isDeleted: false })
      .select(['type.id', 'type.name', 'type.isDeleted']);
    queryBuilder
      .orderBy(`type.${options.sort}`, options.order)
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

    return new PageDto<TypeEntity>(entities, pageMetaDto);
  }

  async findByName(name: string) {
    const category = await this.typeRepository.findOne({
      where: { name: name },
    });
    return category;
  }

  async findOne(id: string) {
    const category = await this.typeRepository.findOne({
      where: { id: id },
    });
    if (!category) {
      throw new HttpException(
        `Type with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return category;
  }

  async update(updateCategoryDto: UpdateTypeProductDto) {
    const category = await this.findOne(updateCategoryDto.id);
    return this.typeRepository.save({
      ...category,
      ...updateCategoryDto,
    });
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    return this.typeRepository.save({
      ...category,
      isDeleted: true,
    });
  }
}
