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
import { FeedbackEntity } from 'src/feedback/entities/feedback.entity';
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
        createProductDto.specification = createProductDto.specification;
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

  async findAllProductsUser(options: PageFilterProductDto): Promise<any> {
    try {
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
        .addSelect(
          (subQuery) =>
            subQuery
              .select('AVG(feedbacks.star)', 'averageRating')
              .from(FeedbackEntity, 'feedbacks')
              .where('feedbacks.productId = products.id'),
          'averageRating',
        )
        .where('products.isDeleted = :isDeleted', { isDeleted: false })
        .andWhere('products.quantity > 0');

      // Lọc theo categoryId
      if (options.categoryId) {
        queryBuilder.andWhere('products.category_id = :categoryId', {
          categoryId: options.categoryId,
        });
      }

      // Lọc theo brandId
      if (options.brandId) {
        queryBuilder.andWhere('products.brand_id = :brandId', {
          brandId: options.brandId,
        });
      }

      // Tìm kiếm theo tên sản phẩm
      if (options.searchText) {
        queryBuilder.andWhere('products.name LIKE :searchText', {
          searchText: `%${options.searchText}%`,
        });
      }

      // Sắp xếp theo giá
      if (options.sortPrice) {
        queryBuilder.orderBy(
          'products.price',
          options.sortPrice === 1 ? 'ASC' : 'DESC',
        );
      }

      // Tổng số lượng sản phẩm
      const totalItems = await queryBuilder.getCount();

      queryBuilder.skip(skip).take(options.limit);

      const rawEntities = await queryBuilder.getRawMany();

      if (!Array.isArray(rawEntities)) {
        throw new BadRequestException('Query did not return a valid array');
      }

      // Tính toán averageRating
      const productsWithRatings = rawEntities.map((entity) => ({
        ...entity,
        averageRating: parseFloat(entity.averageRating) || 0,
      }));

      // Khởi tạo PageMetaDto
      const pageMetaDto = new PageMetaDto({
        itemCount: totalItems,
        pageOptionsDto: options,
      });

      // Trả về PageDto
      return new PageDto<any>(productsWithRatings, pageMetaDto);
    } catch (error) {
      console.error('Error in findAllProductsUser:', error);
      throw new BadRequestException(error.message || 'Query failed');
    }
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
    const queryBuilder = this.productRepository.createQueryBuilder('products');

    const products = await queryBuilder
      .select([
        'products.id',
        'products.name',
        'products.image',
        'products.description',
        'products.price',
        'products.oldprice',
      ])
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COALESCE(AVG(feedbacks.star), 0)', 'averageRating') // Sử dụng COALESCE để xử lý null
            .from(FeedbackEntity, 'feedbacks')
            .where('feedbacks.productId = products.id'),
        'averageRating',
      )
      .where('products.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('products.quantity > 0')
      .orderBy('products.buyturn', 'DESC')
      .take(limit)
      .getRawMany();

    return products;
  }

  async findOneQualityProduct(id: string) {
    const product = this.productRepository.findOne({
      where: {
        id,
      },
    });
    return product;
  }
}
