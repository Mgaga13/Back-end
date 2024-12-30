import {
  BadRequestException,
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
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { PageDto } from 'src/commom/dto/page.dto';
import { PageMetaDto } from 'src/commom/dto/pageMeta.dto';

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
  // async create(createOrderDto: CreateOrderDto): Promise<OrderEntity> {
  //   return await this.orderRepository.save(createOrderDto);
  // }

  // Find one order by ID
  async findOne(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!order) throw new NotFoundException(`Order with ID ${id} not found`);
    return order;
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
  /**
   * description: Lấy danh sách đơn hàng
   * @param options
   * @returns
   */
  async findAll(options: PageOptionsDto): Promise<any> {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder =
      this.orderDetailRepository.createQueryBuilder('orderDetail');

    queryBuilder
      .leftJoinAndSelect('orderDetail.order', 'order')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('orderDetail.product', 'product')
      .where('order.isDeleted = :isDeleted', { isDeleted: false })
      .select([
        'orderDetail',
        'product.name',
        'order.id',
        // 'order.paymentMethod',
        // 'order.paymentStatus',
        // 'order.createdAt',
        'user.name', // Lấy tên khách hàng từ bảng user
      ])
      .orderBy(`orderDetail.${options.sort}`, options.order) // Sắp xếp theo trường được chỉ định
      .skip(skip)
      .take(options.limit);

    const { entities } = await queryBuilder
      .getRawAndEntities()
      .catch((error: any) => {
        throw new BadRequestException(error);
      });

    const itemCount: number = await queryBuilder.getCount();

    const pageMetaDto: PageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: options,
    });

    return new PageDto<OrderDetailEntity>(entities, pageMetaDto);
  }

  /**
   * description: Lấy danh sách đơn hàng theo user_id
   * @param userId
   * @param options
   * @returns
   */
  async findOrdersByUserId(
    userId: number,
    options: PageOptionsDto,
  ): Promise<any> {
    const skip = (options.page - 1) * options.limit;
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    queryBuilder
      .leftJoinAndSelect('order.user', 'user') // Liên kết với bảng user
      .leftJoinAndSelect('order.orderDetails', 'orderDetail')
      .leftJoinAndSelect('orderDetail.product', 'product')
      .where('order.isDeleted = :isDeleted', { isDeleted: false })
      .where('order.paymentStatus = :status', { status: true })
      .andWhere('user.id = :userId', { userId }) // Điều kiện lọc theo user_id
      .select([
        'order.id',
        'order.total',
        'order.paymentMethod',
        'order.paymentStatus',
        'order.createdAt',
        'orderDetail.id',
        'orderDetail.status',
        'orderDetail.price',
        'product.id',
        'product.name',
      ])
      .orderBy(`order.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit);

    const [orders, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto: PageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: options,
    });

    return new PageDto<OrderEntity>(orders, pageMetaDto);
  }
  /**
   * description: Cập nhật trạng thái đơn hàng
   * @param orderId
   * @param status
   * @returns
   */
  async updateOrderStatus(orderId: string, status: number) {
    const order = await this.orderDetailRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    order.status = status;
    return this.orderDetailRepository.save(order);
  }
  /**
   * description: Lấy danh sách chi tiết đơn hàng
   * @param options
   * @returns
   */
  async findOrdersDetail(options: PageOptionsDto): Promise<any> {
    const skip = (options.page - 1) * options.limit;

    const queryBuilder =
      this.orderDetailRepository.createQueryBuilder('order_detail');

    queryBuilder
      .where('order_detail.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy(`order_detail.${options.sort}`, options.order)
      .skip(skip)
      .take(options.limit);

    const [orders, itemCount] = await queryBuilder.getManyAndCount();

    const pageMetaDto: PageMetaDto = new PageMetaDto({
      itemCount,
      pageOptionsDto: options,
    });

    return new PageDto<OrderDetailEntity>(orders, pageMetaDto);
  }
}
