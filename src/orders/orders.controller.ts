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
  // @Post()
  // update(@Req() req: string, @Body() body: { status: number }) {
  //   const user = req['user'];
  //   return this.ordersService.update(user.id, body.status);
  // }
  @Get()
  findAll(@Query() pageOptionsDto: PageOptionsDto) {
    return this.ordersService.findAll(pageOptionsDto);
  }

  @Get('user/:id')
  findAllByUser(@Req() req, @Query() pageOptionsDto: PageOptionsDto) {
    const user = req['user'];
    return this.ordersService.findOrdersByUserId(user.id, pageOptionsDto);
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
