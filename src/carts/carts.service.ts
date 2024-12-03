import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItemEntity } from 'src/cart_items/entities/cart_item.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    private readonly userService: UsersService,
    private readonly productService: ProductsService,
  ) {}

  async calculateTotal(cartId: string): Promise<number> {
    const cartItems = await this.cartItemRepository.find({
      where: { cart: { id: cartId } },
      relations: ['product'],
    });

    return cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
  }

  async findAll(): Promise<CartEntity[]> {
    return await this.cartRepository.find({ relations: ['user'] });
  }
  async addItemToCart(createCartDto: CreateCartDto): Promise<CartEntity> {
    // Lấy giỏ hàng của người dùng
    const cart = await this.cartRepository.findOne({
      where: { user: { id: createCartDto.user_id } },
      relations: ['cartItems'],
    });

    if (!cart) {
      throw new Error('Cart does not exist for this user.');
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng chưa
    const existingCartItem = cart.cartItems.find(
      (item) => item.product.id === createCartDto.productId,
    );
    if (existingCartItem) {
      // Nếu sản phẩm đã có trong giỏ hàng, cập nhật số lượng
      existingCartItem.quantity += createCartDto.quantity;
      await this.cartItemRepository.save(existingCartItem);
    } else {
      // Nếu chưa có, thêm sản phẩm vào giỏ hàng
      const product = await this.productService.findOne(
        createCartDto.productId,
      );
      if (!product) {
        throw new Error('Product not found.');
      }

      const cartItem = this.cartItemRepository.create({
        cart,
        product,
        quantity: createCartDto.quantity,
      });
      await this.cartItemRepository.save(cartItem);
    }

    // Trả về giỏ hàng đã cập nhật
    return this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['cartItems', 'cartItems.product'],
    });
  }

  async findOne(id: string): Promise<CartEntity> {
    const cart = await this.cartRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!cart) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
    return cart;
  }

  async update(id: string, updateCartDto: UpdateCartDto): Promise<CartEntity> {
    const cart = await this.findOne(id);

    // Kiểm tra điều kiện cụ thể trước khi cập nhật
    if (!cart) {
      throw new Error('Cannot change session_id for an existing cart.');
    }

    // Cập nhật thông tin
    return this.cartRepository.save({
      ...cart,
      ...updateCartDto,
    });
  }

  async remove(id: string): Promise<void> {
    const cart = await this.findOne(id);

    // Kiểm tra điều kiện trước khi xóa
    const cartItems = await this.cartItemRepository.find({
      where: { cart: { id: cart.id } },
    });

    if (cartItems.length > 0) {
      throw new Error(
        'Cannot delete a cart with items. Please empty the cart first.',
      );
    }

    const result = await this.cartRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Cart with ID ${id} not found`);
    }
  }
}
