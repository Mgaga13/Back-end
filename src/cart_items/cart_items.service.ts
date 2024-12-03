import { Injectable } from '@nestjs/common';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from 'src/products/entities/product.entity';
import { CartEntity } from 'src/carts/entities/cart.entity';
import { CartItemEntity } from './entities/cart_item.entity';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async createCartItem(dto: CreateCartItemDto): Promise<CartItemEntity> {
    const cart = await this.cartRepository.findOne({
      where: { id: dto.cartId },
    });
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });

    if (!cart || !product) {
      throw new Error('Cart or Product not found');
    }

    const cartItem = this.cartItemRepository.create({
      cart,
      product,
      quantity: dto.quantity,
    });
    return this.cartItemRepository.save(cartItem);
  }

  async getCartItems(cartId: string): Promise<CartItemEntity[]> {
    return this.cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ['cart', 'product'],
    });
  }

  async updateCartItemQuantity(
    cartItemId: string,
    quantity: number,
  ): Promise<CartItemEntity> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId },
    });
    if (!cartItem) {
      throw new Error('Cart Item not found');
    }

    cartItem.quantity = quantity;
    return this.cartItemRepository.save(cartItem);
  }

  async deleteCartItem(cartItemId: string): Promise<void> {
    await this.cartItemRepository.delete(cartItemId);
  }
}
