import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderDetailsService } from './order-details.service';
import { CreateOrderDetailDto } from './dto/create-order-detail.dto';
import { UpdateOrderDetailDto } from './dto/update-order-detail.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { Roles } from 'src/auth/decorators/roler.decorator';
import { UserRole } from 'src/commom/utils/constants';
import { RolesGuard } from 'src/auth/guards/roles.guard';

@UseGuards(JwtAuthGuard)
@Controller('v1/order-details')
export class OrderDetailsController {
  constructor(private readonly orderDetailsService: OrderDetailsService) {}

  @Post()
  create(@Body() createOrderDetailDto: CreateOrderDetailDto) {
    return this.orderDetailsService.create(createOrderDetailDto);
  }

  @Get()
  findAll() {
    return this.orderDetailsService.findAll();
  }
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Get('/best-selling')
  bestSelling() {
    return this.orderDetailsService.getBestSellingProducts();
  }

  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  @Get('revenue-statistics')
  async getRevenueStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'month' | 'year' = 'day',
  ) {
    return this.orderDetailsService.getRevenueStatistics(
      startDate,
      endDate,
      groupBy,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderDetailsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateOrderDetailDto: UpdateOrderDetailDto,
  ) {
    return this.orderDetailsService.update(id, updateOrderDetailDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderDetailsService.remove(id);
  }
}
