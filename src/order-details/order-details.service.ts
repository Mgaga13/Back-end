import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderDetailEntity } from './entities/order-detail.entity';
import { Repository } from 'typeorm';

@Injectable()
export class OrderDetailsService {
  constructor(
    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepository: Repository<OrderDetailEntity>,
  ) {}

  // Create a new order detail
  async create(
    createOrderDetailDto: CreateOrderDetailDto,
  ): Promise<OrderDetailEntity> {
    const orderDetail = this.orderDetailRepository.create(createOrderDetailDto);
    return await this.orderDetailRepository.save(orderDetail);
  }

  // Find all order details
  async findAll(): Promise<OrderDetailEntity[]> {
    return await this.orderDetailRepository.find({
      relations: ['order', 'product'],
    });
  }

  // Find one order detail by ID
  async findOne(id: string): Promise<OrderDetailEntity> {
    const orderDetail = await this.orderDetailRepository.findOne({
      where: { id },
      relations: ['order', 'product'],
    });
    if (!orderDetail)
      throw new NotFoundException(`Order detail with ID ${id} not found`);
    return orderDetail;
  }

  // Update an order detail by ID
  async update(
    id: string,
    updateOrderDetailDto: UpdateOrderDetailDto,
  ): Promise<OrderDetailEntity> {
    await this.orderDetailRepository.update(id, updateOrderDetailDto);
    return this.findOne(id);
  }

  // Remove an order detail by ID
  async remove(id: string): Promise<void> {
    const deleteResult = await this.orderDetailRepository.delete(id);
    if (!deleteResult.affected)
      throw new NotFoundException(`Order detail with ID ${id} not found`);
  }

  async getRevenueStatistics(
    startDate?: string,
    endDate?: string,
    groupBy: 'day' | 'month' | 'year' = 'day',
  ): Promise<any> {
    const queryBuilder = this.orderDetailRepository
      .createQueryBuilder('od')
      .leftJoin('od.order', 'o')
      .select('SUM(od.price * od.quantity)', 'total_revenue');

    // Thêm điều kiện về trạng thái đơn hàng (đã hoàn thành)
    queryBuilder.where('o.status = :status', { status: 1 });

    // Nếu có khoảng thời gian, thêm điều kiện về ngày
    if (startDate) {
      queryBuilder.andWhere('o.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('o.createdAt <= :endDate', { endDate });
    }

    // Thay đổi cách nhóm theo ngày, tháng, hoặc năm
    switch (groupBy) {
      case 'month':
        queryBuilder
          .addSelect("DATE_TRUNC('month', o.createdAt)", 'date') // Group by month
          .groupBy("DATE_TRUNC('month', o.createdAt)");
        break;
      case 'year':
        queryBuilder
          .addSelect('EXTRACT(YEAR FROM o.createdAt)', 'date') // Group by year
          .groupBy('EXTRACT(YEAR FROM o.createdAt)');
        break;
      case 'day':
      default:
        queryBuilder
          .addSelect('DATE(o.createdAt)', 'date') // Group by day
          .groupBy('DATE(o.createdAt)');
        break;
    }

    queryBuilder.orderBy('date', 'DESC'); // Order by date descending
    console.log(queryBuilder.getQuery());
    return await queryBuilder.getRawMany();
  }

  async getBestSellingProducts() {
    return await this.orderDetailRepository
      .createQueryBuilder('od')
      .leftJoin('od.product', 'p')
      .leftJoin('od.order', 'o')
      .select('p.id', 'product_id')
      .addSelect('p.name', 'product_name')
      .addSelect('SUM(od.quantity)', 'total_quantity_sold')
      .addSelect('SUM(od.price * od.quantity)', 'total_revenue')
      .where('o.status = :status', { status: 1 }) // Đã hoàn thành
      .groupBy('p.id, p.name')
      .orderBy('total_quantity_sold', 'DESC')
      .getRawMany();
  }
}
