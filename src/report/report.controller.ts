import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { StatisticsDto } from './dto/static.dto';
import { StatisticsDtoMoth } from './dto/static.month.dto';

@Controller('v1/report')
export class ReportController {
  constructor(private readonly orderStatisticsService: ReportService) {}
  @Get()
  async getStatistics(@Query() statisticsDto: StatisticsDto) {
    // totalOrders: Tổng số đơn hàng.
    // totalRevenue: Tổng doanh thu.
    // status: Trạng thái của đơn hàng
    const result =
      await this.orderStatisticsService.getStatistics(statisticsDto);
    const { status, totalOrders, totalRevenue } = result[0] ?? '';
    return {
      status: status || 0,
      totalOrders: totalOrders || 0,
      totalRevenue: totalRevenue || 0,
    };
  }
  @Get('top-selling-products')
  async getTopSellingProducts(
    @Query('limit') limit: number,
    @Query('startDate') startDate: any,
    @Query('endDate') endDate: any,
  ) {
    const maxLimit = limit && limit > 0 ? limit : 5; // Mặc định lấy 5 sản phẩm
    return this.orderStatisticsService.getTopSellingProducts(
      maxLimit,
      startDate,
      endDate,
    );
  }
  @Get('month')
  async getStatisticsMonth(@Query() statisticsDto: StatisticsDtoMoth) {
    return this.orderStatisticsService.getMonthlyStatistics(statisticsDto);
  }
  // constructor(private readonly reportService: ReportService) {}
  // @Post()
  // create(@Body() createReportDto: CreateReportDto) {
  //   return this.reportService.create(createReportDto);
  // }
  // @Get()
  // findAll() {
  //   return this.reportService.findAll();
  // }
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.reportService.findOne(+id);
  // }
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
  //   return this.reportService.update(+id, updateReportDto);
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.reportService.remove(+id);
  // }
}
