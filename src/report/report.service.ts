import { Injectable } from '@nestjs/common';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { OrderEntity } from 'src/orders/entities/order.entity';
import { StatisticsDto } from './dto/static.dto';
import { OrderDetailEntity } from 'src/order-details/entities/order-detail.entity';
import { StatisticsDtoMoth } from './dto/static.month.dto';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly orderRepository: Repository<OrderEntity>,
    @InjectRepository(OrderDetailEntity)
    private readonly orderDetailRepository: Repository<OrderDetailEntity>,
  ) {}

  /**
   * Tổng số sản phẩm được mua nhiều nhất
   * @param limit
   * @returns
   */
  async getTopSellingProducts(
    limit: number = 5,
    startDate?: Date,
    endDate?: Date,
  ) {
    const query = this.orderDetailRepository
      .createQueryBuilder('orderDetail')
      .select('orderDetail.product_id', 'productId')
      .addSelect('SUM(orderDetail.quantity)', 'totalQuantity')
      .addSelect('product.name', 'productName')
      .innerJoin('orderDetail.product', 'product')
      .groupBy('orderDetail.product_id, product.name')
      .orderBy('SUM(orderDetail.quantity)', 'DESC')
      .limit(limit);
    // Thêm điều kiện ngày nếu có
    if (startDate) {
      query.andWhere('orderDetail.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('orderDetail.createdAt <= :endDate', { endDate });
    }

    const topProducts = await query.getRawMany();
    return topProducts;
  }

  /**
   * description Lấy thông tin thống kê: tổng số đơn, tổng doanh thu
   * @param param0
   * @returns
   */
  async getStatistics({ startDate, endDate }: StatisticsDto) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select('COUNT(order.id)', 'totalOrders')
      .addSelect('SUM(order.total)', 'totalRevenue')
      .where('order.paymentStatus = true');

    if (startDate && endDate) {
      query.where('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      query.where('order.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      query.where('order.createdAt <= :endDate', { endDate });
    } else {
      throw new Error(
        'At least one parameter (startDate or endDate) must be provided.',
      );
    }
    return query.getRawMany();
  }

  // Doanh thu tháng
  async getMonthlyStatistics({ startYear, endYear }: StatisticsDtoMoth) {
    const query = this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.createdAt, 'Month')", 'month')
      .addSelect('EXTRACT(MONTH FROM order.createdAt)', 'monthNumber')
      .addSelect('SUM(order.total)', 'totalRevenue')
      .andWhere('EXTRACT(YEAR FROM order.createdAt) = :startYear', {
        startYear,
      }) // Lọc theo năm
      .groupBy(
        "TO_CHAR(order.createdAt, 'Month'), EXTRACT(MONTH FROM order.createdAt)",
      )
      .orderBy('EXTRACT(MONTH FROM order.createdAt)', 'ASC');

    const rawData = await query.getRawMany();

    // Xử lý dữ liệu để đảm bảo định dạng phù hợp
    const monthlyData = Array(12).fill(0);
    rawData.forEach((item) => {
      const monthIndex = Number(item.monthNumber) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex] = parseFloat(item.totalRevenue);
      }
    });

    return {
      labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ], // Tên tháng
      datasets: [
        {
          label: 'Revenue ($)',
          data: monthlyData, // Doanh thu tương ứng từng tháng
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  }
}
