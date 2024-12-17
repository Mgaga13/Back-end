import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PageProductDto } from './dto/page-product.dto';
import { PageDto } from 'src/commom/dto/page.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';
import { CategoriesService } from 'src/categories/categories.service';
import { BrandsService } from 'src/brands/brands.service';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // Create a new product
  async create(createProductDto: CreateProductDto): Promise<any> {
    const existsProduct = await this.findOneByName(createProductDto.name);
    if (existsProduct) {
      throw new HttpException(
        `${createProductDto.name} has created`,
        HttpStatus.CONFLICT,
      );
    }
    const product = this.productRepository.create({
      ...createProductDto,
      brand: { id: createProductDto.brand_id },
      category: { id: createProductDto.category_id },
    });
    return await this.productRepository.save(product);
  }
  async findAllProducts(
    options: PageProductDto,
  ): Promise<PageDto<ProductEntity>> {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.productRepository
      .createQueryBuilder('products')
      .leftJoinAndSelect('products.brand', 'brand')
      .leftJoinAndSelect('products.category', 'category')
      .where('products.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy(`products.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit);
    const [entities, itemCount] = await queryBuilder
      .getManyAndCount()
      .catch((error: any) => {
        throw new BadRequestException(error.message || 'Query failed');
      });

    const pageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: options,
    });

    return new PageDto<ProductEntity>(entities, pageMetaDto);
  }

  // Find all products
  async findAll(): Promise<{ success: boolean; result: ProductEntity[] }> {
    const products = await this.productRepository.find({
      relations: ['brand', 'category'],
    });
    return {
      success: true,
      result: products,
    };
  }

  // Find a product by ID
  async findOne(id: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'category'],
    });
    if (!product)
      throw new NotFoundException(`Product with ID ${id} not found`);
    return product;
  }

  async findOneByName(name: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { name },
    });
    return product;
  }

  // Update a product by ID
  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductEntity> {
    await this.productRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  // Remove a product by ID
  async remove(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Set isDeleted to true instead of deleting the record
    product.isDeleted = true;
    await this.productRepository.save(product);
  }
}
