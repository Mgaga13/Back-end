import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderEntity } from './entities/order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderDetailEntity } from 'src/order-details/entities/order-detail.entity';
import { CartEntity } from 'src/carts/entities/cart.entity';
import { CartItemEntity } from 'src/cart_items/entities/cart_item.entity';
import { PageOptionsReciptDto } from './dto/PageOptionsReciptDto.dto';

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

  async createOrderFromCart(userId: string): Promise<OrderEntity> {
    // Lấy giỏ hàng của người dùng
    const cart = await this.cartRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!cart) throw new NotFoundException('Cart not found.');

    // Lấy tất cả sản phẩm trong giỏ hàng
    const cartItems = await this.cartItemRepository.find({
      where: { cart: { id: cart.id } },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty.');
    }

    // Tính tổng giá trị đơn hàng
    const total = cartItems.reduce(
      (sum, item) => sum + item.quantity * item.product.price,
      0,
    );

    // Tạo đơn hàng
    const order = this.orderRepository.create({
      user: cart.user,
      status: 1, // Pending
      total,
    });
    const savedOrder = await this.orderRepository.save(order);

    // Lưu chi tiết đơn hàng
    const orderDetails = cartItems.map((item) =>
      this.orderDetailRepository.create({
        order: savedOrder,
        product: item.product,
        price: item.product.price,
        quantity: item.quantity,
      }),
    );

    await this.orderDetailRepository.save(orderDetails);

    // Xóa giỏ hàng
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
    await this.cartRepository.delete(cart.id);

    return savedOrder;
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
