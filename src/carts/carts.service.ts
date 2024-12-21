import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CartEntity } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { CartItemEntity } from 'src/cart_items/entities/cart_item.entity';
import { UsersService } from 'src/users/users.service';
import { ProductsService } from 'src/products/products.service';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { PageDto } from 'src/commom/dto/page.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
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
  async addItemToCart(userId, createCartDto: CreateCartDto) {
    const { productId } = createCartDto;

    // Tìm giỏ hàng của người dùng, bao gồm các mục giỏ hàng và thông tin sản phẩm
    let cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems', 'cartItems.product'], // Thêm 'cartItems.product' để tải dữ liệu sản phẩm
    });

    // Nếu giỏ hàng chưa tồn tại, tạo mới
    if (!cart) {
      cart = this.cartRepository.create({
        user: { id: userId },
        cartItems: [],
      });
      cart = await this.cartRepository.save(cart);
    }

    // Kiểm tra xem sản phẩm đã tồn tại trong giỏ hàng hay chưa
    const existingCartItem = cart.cartItems.find(
      (item) => item.product.id === productId, // Truy cập product.id để kiểm tra
    );

    console.log('Existing Cart Item:', existingCartItem);

    if (existingCartItem) {
      // Nếu sản phẩm đã tồn tại, cập nhật số lượng
      existingCartItem.quantity += 1;
      await this.cartItemRepository.save(existingCartItem);
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm mới
      const newCartItem = this.cartItemRepository.create({
        cart,
        product: { id: productId },
        quantity: 1, // Đặt số lượng mặc định là 1
      });
      await this.cartItemRepository.save(newCartItem);
    }

    return { message: 'Product added to cart successfully', cartId: cart.id };
  }

  async removeItemFromCart(cartItemID: string, productId: string) {
    // Tìm mục giỏ hàng cần xóa
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        id: cartItemID,
      },
    });

    // Nếu không tìm thấy, trả về lỗi
    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with cartId ${cartItemID} and productId ${productId} not found`,
      );
    }

    // Xóa mục giỏ hàng
    await this.cartItemRepository.remove(cartItem);

    return { message: 'Product removed from cart-item successfully' };
  }

  async findCartByUser(userId: string, options: PageOptionsDto) {
    const skip = (options.page - 1) * options.limit;

    // Tìm giỏ hàng của người dùng
    const queryBuilder = this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.cartItems', 'cartItems')
      .leftJoinAndSelect('cartItems.product', 'product')
      .where('cart.userId = :userId', { userId });

    queryBuilder
      .orderBy(`cartItems.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit);
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

    return new PageDto<any>(entities, pageMetaDto);
  }
  async updateItemQuantity(
    cartId: string,
    productId: string,
    quantity: string,
  ) {
    // Tìm mục giỏ hàng
    const cartItem = await this.cartItemRepository.findOne({
      where: {
        cart: { id: cartId },
        product: { id: productId },
      },
    });

    // Nếu không tìm thấy, trả về lỗi
    if (!cartItem) {
      throw new NotFoundException(
        `Cart item with cartId ${cartId} and productId ${productId} not found`,
      );
    }

    // Cập nhật số lượng
    if (quantity === 'increment') {
      cartItem.quantity += 1;
    } else {
      cartItem.quantity -= 1;
    }

    await this.cartItemRepository.save(cartItem);

    return { message: 'Quantity updated successfully', cartItem };
  }

  async getCartItemCount(userId: string): Promise<number> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['cartItems'], // Chỉ cần lấy các mục giỏ hàng
    });

    // Nếu không tìm thấy giỏ hàng, trả về 0
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    // Trả về số lượng các mục trong giỏ hàng
    return cart.cartItems.length;
  }
  // async update(id: string, updateCartDto: UpdateCartDto): Promise<CartEntity> {
  //   const cart = await this.findOne(id);

  //   // Kiểm tra điều kiện cụ thể trước khi cập nhật
  //   if (!cart) {
  //     throw new Error('Cannot change session_id for an existing cart.');
  //   }

  //   // Cập nhật thông tin
  //   return this.cartRepository.save({
  //     ...cart,
  //     ...updateCartDto,
  //   });
  // }

  // async remove(id: string): Promise<void> {
  //   const cart = await this.findOne(id);

  //   // Kiểm tra điều kiện trước khi xóa
  //   const cartItems = await this.cartItemRepository.find({
  //     where: { cart: { id: cart.id } },
  //   });

  //   if (cartItems.length > 0) {
  //     throw new Error(
  //       'Cannot delete a cart with items. Please empty the cart first.',
  //     );
  //   }

  //   const result = await this.cartRepository.delete(id);
  //   if (result.affected === 0) {
  //     throw new NotFoundException(`Cart with ID ${id} not found`);
  //   }
  // }
}
