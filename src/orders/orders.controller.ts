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
  Req,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { pick } from 'src/commom/utils/helper';

@UseGuards(JwtAuthGuard)
@Controller('v1/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // @Post()
  // create(@Body() createOrderDto: CreateOrderDto) {
  //   const userId = '1';
  //   // console.log(userId)
  //   return this.ordersService.createOrderFromCart(userId);
  // }
  @Post()
  update(@Body() body: { orderId: string; status: number }) {
    return this.ordersService.updateOrderStatus(body.orderId, body.status);
  }
  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    const options = pick(pageOptionsDto, [
      'page',
      'limit',
      'sort',
      'order',
      'status',
    ]);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.ordersService.findAll(pageOptionsDto);
  }

  @Get('user')
  findAllByUser(@Req() req, @Query() pageOptionsDto: PageOptionsDto) {
    const user = req['user'];
    const options = pick(pageOptionsDto, ['page', 'limit', 'sort', 'order']);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.ordersService.findOrdersByUserId(user.id, pageOptionsDto);
  }
  @Get('/all')
  findAllDetailOrders(@Query() pageOptionsDto: PageOptionsDto) {
    const options = pick(pageOptionsDto, ['page', 'limit', 'sort', 'order']);
    options.limit = options.limit > 100 ? 100 : options.limit;
    return this.ordersService.findOrdersDetail(options);
  }

  @Patch(':id/status')
  async updateOrderStatus(
    @Param('id') orderId: string,
    @Body() updateOrderStatusDto: { status: number },
  ) {
    return this.ordersService.updateOrderStatus(
      orderId,
      updateOrderStatusDto.status,
    );
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
