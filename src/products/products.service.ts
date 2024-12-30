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
import { PageFilterProductDto } from './dto/page-product.filter.dto';
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
    if (typeof createProductDto.specification === 'string') {
      try {
        createProductDto.specification = JSON.parse(
          createProductDto.specification,
        );
      } catch (error) {
        throw new HttpException(
          'Invalid JSON format for specification',
          HttpStatus.BAD_REQUEST,
        );
      }
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
      .where('products.isDeleted = :isDeleted', { isDeleted: false });
    if (options.searchText) {
      queryBuilder.andWhere('products.name LIKE :searchText', {
        searchText: `%${options.searchText}%`, // Adding % for LIKE pattern matching
      });
    }
    queryBuilder
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

  async findAllProductsUser(
    options: PageFilterProductDto,
  ): Promise<PageDto<ProductEntity>> {
    const skip = (options.page - 1) * options.limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('products')
      .select([
        'products.id',
        'products.name',
        'products.image',
        'products.description',
        'products.price',
        'products.oldprice',
      ])
      .where('products.isDeleted = :isDeleted', { isDeleted: false });

    // Thêm điều kiện tìm kiếm theo categoryId
    if (options.categoryId) {
      queryBuilder.andWhere('products.category_id = :categoryId', {
        categoryId: options.categoryId,
      });
    }

    // Thêm điều kiện tìm kiếm theo brandId
    if (options.brandId) {
      queryBuilder.andWhere('products.brand_id = :brandId', {
        brandId: options.brandId,
      });
    }

    // Tìm kiếm theo searchText
    if (options.searchText) {
      queryBuilder.andWhere('products.name LIKE :searchText', {
        searchText: `%${options.searchText}%`, // Adding % for LIKE pattern matching
      });
    }
    if (options.sort === 'price') {
      queryBuilder.orderBy(
        'products.price',
        options.sortPrice === 1 ? 'ASC' : 'DESC',
      );
    } else {
      queryBuilder.orderBy(
        `products.${options.sort}`,
        options.sortPrice === 1 ? 'ASC' : 'DESC',
      );
    }

    queryBuilder.skip(skip).take(options.limit);

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
    const products = await this.productRepository.find();
    return {
      success: true,
      result: products,
    };
  }

  // Find a product by ID
  async findOne(id: string): Promise<any> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'category', 'feedbacks'], // Liên kết với bảng 'brand' và 'category'
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // Trả về thông tin sản phẩm kèm theo id của category và brand
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      oldprice: product.oldprice,
      image: product.image,
      description: product.description,
      specification: product.specification,
      buyturn: product.buyturn,
      quantity: product.quantity,
      brand_id: product.brand?.id, // Lấy id của brand nếu có
      category_id: product.category?.id, // Lấy id của category nếu có
      feedbacks: product.feedbacks,
    };
  }

  async findOneByName(name: string): Promise<ProductEntity> {
    const product = await this.productRepository.findOne({
      where: { name },
    });
    return product;
  }

  // Update a product by ID
  async update(updateProductDto: UpdateProductDto): Promise<ProductEntity> {
    const { brand_id, category_id, id, image, specification, ...productData } =
      updateProductDto;

    // Tìm sản phẩm hiện tại
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['brand', 'category'], // Đảm bảo các mối quan hệ được tải
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    // Update specification only if provided
    if (specification !== undefined) {
      product.specification = specification;
    }
    // Cập nhật các trường khác
    Object.assign(product, productData);
    if (image && image.length > 0) {
      product.image = [...product.image, ...image]; // Gộp ảnh mới vào danh sách ảnh hiện tại
    }
    // Cập nhật brand và category nếu có

    product.brand.id = brand_id;

    product.category.id = category_id;

    // Lưu lại sản phẩm đã cập nhật
    await this.productRepository.save(product);

    return this.findOne(id);
  }

  // Remove a product by ID
  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    // Set isDeleted to true instead of deleting the record
    product.isDeleted = true;
    await this.productRepository.save(product);
  }
  async getTopSellingProducts(limit: number) {
    return await this.productRepository.find({
      order: { buyturn: 'DESC' },
      take: limit,
    });
  }
}
