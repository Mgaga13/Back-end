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
}
