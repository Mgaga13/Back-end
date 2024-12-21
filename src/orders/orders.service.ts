import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetailEntity } from 'src/order-details/entities/order-detail.entity';
import { CartEntity } from 'src/carts/entities/cart.entity';
import { CartItemEntity } from 'src/cart_items/entities/cart_item.entity';
import { PageOptionsReciptDto } from './dto/PageOptionsReciptDto.dto';
import { ProductEntity } from 'src/products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepository: Repository<OrderDetailEntity>,
    @InjectRepository(CartEntity)
    private readonly cartRepository: Repository<CartEntity>,
    @InjectRepository(CartItemEntity)
    private readonly cartItemRepository: Repository<CartItemEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  // Create a new order
  async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
    return await this.orderRepository.save(createOrderDto);
  }

  // Find all orders
  async findAll(): Promise<OrderEntity[]> {
    return await this.orderRepository.find({ relations: ['user'] });
  }

  // Find one order by ID
  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
  }

  // Update an order by ID
  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<OrderEntity> {
    await this.orderRepository.update(id, updateOrderDto);
    return this.findOne(id);
  }

  // Remove an order by ID
  async remove(id: string): Promise<void> {
    const deleteResult = await this.orderRepository.delete(id);
    if (!deleteResult.affected)
      throw new NotFoundException(`Order with ID ${id} not found`);
  }
  async calculateOrderTotal(cartItemChose: any, userId: string): Promise<any> {
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!cart) throw new NotFoundException('Cart not found.');

    const cartItems = await this.cartItemRepository.find({
      where: { cart: { id: cart.id } },
      relations: ['product'],
    });
    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty.');
    }
    const selectedCartItems = cartItems.filter((cartItem) => {
      // Kiểm tra xem ID của cartItem có trong mảng `cartItemChose` không
      return cartItemChose.includes(cartItem.id);
    });

    // Tính tổng giá trị đơn hàng
    const total = selectedCartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    return {
      total: total,
      selectedCartItems: selectedCartItems,
    };
  }
  async createOrderFromCart(
    total,
    selectedCartItems: any,
    userId: string,
    payment: string,
    paymentCode: string,
  ): Promise<any> {
    // Lấy giỏ hàng của người dùng
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!cart) throw new NotFoundException('Cart not found.');

    const order = this.orderRepository.create({
      user: cart.user,
      status: 0, // Pending
      paymentMethod: payment,
      paymentReference: paymentCode,
      total,
    });
    const savedOrder = await this.orderRepository.save(order);

    // Lưu chi tiết đơn hàng
    const orderDetails = selectedCartItems.map((item) =>
      this.orderDetailRepository.create({
        order: savedOrder,
        product: item.product,
        price: item.product.price,
        quantity: item.quantity,
      }),
    );

    await this.orderDetailRepository.save(orderDetails);
    delete savedOrder.user;
    return {
      savedOrder,
      success: true,
    };
  }
  async checkOrder(paymentReference: string) {
    // Tìm đơn hàng dựa trên paymentReference
    const order = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.orderDetails', 'orderDetails') // Lấy orderDetails
      .leftJoinAndSelect('orderDetails.product', 'product') // Chỉ lấy nếu cần
      .leftJoinAndSelect('order.user', 'user') // Lấy user
      .leftJoinAndSelect('user.carts', 'cart') // Lấy carts của user
      .leftJoinAndSelect('cart.cartItems', 'cartItem') // Lấy cartItems
      .select([
        'order.id', // Lấy id của order
        'orderDetails',
        'product', // Lấy id của orderDetails
        'user.id', // Lấy id của user
        'cart.id', // Lấy id của cart
        'cartItem', // Lấy id của cartItems
      ])
      .where('order.paymentReference = :paymentReference', { paymentReference })
      .getOne();
    const order_details_product = order.orderDetails.map(
      (val) => val.product.id,
    ); // Lấy id sản phẩm trong đơn hàng
    console.log(order_details_product);
    order_details_product.map(async (val: any) => {
      await this.cartItemRepository
        .createQueryBuilder()
        .delete()
        .from(CartItemEntity)
        .where('product_id = :productId', { productId: val }) // Lọc theo product id
        .execute();
    });
    for (const orderDetail of order.orderDetails) {
      const productId = orderDetail.product.id;
      const productQuantity = orderDetail.product.quantity;
      const quantity = productQuantity - orderDetail.quantity;
      const turnOn = orderDetail.product.buyturn + 1;
      await this.productRepository.update(productId, {
        quantity: quantity,
        buyturn: turnOn,
      });
    }
    return await this.orderRepository.update(order.id, { paymentStatus: true });
  }

  async getTotalOrder(options: PageOptionsReciptDto): Promise<any> {
    const queryBuilder = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.user', 'users')
      .select('SUM(order.price) as Price')
      .where('order.isDeleted = :isDeleted', { isDeleted: false });
    if (options.startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', {
        startDate: options.startDate,
      });
    }
    if (options.endDate) {
      queryBuilder.andWhere('order.createdAt < :endDate', {
        endDate: options.endDate,
      });
    }
    const result = await queryBuilder.getRawMany();
    return result;
  }
}
