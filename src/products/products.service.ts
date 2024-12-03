import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductEntity } from './entities/product.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // Create a new product
  async create(createProductDto: CreateProductDto): Promise<ProductEntity> {
    return await this.productRepository.save(createProductDto);
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
