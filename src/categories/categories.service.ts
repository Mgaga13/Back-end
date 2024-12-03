import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryEntity } from './entities/category.entity';
import { DataSource, Repository } from 'typeorm';

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

  async findAll() {
    const categories = await this.categoryRepository.find();
    return {
      success: true,
      result: categories,
    };
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
      throw new Error(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
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
