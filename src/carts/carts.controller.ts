import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CartsService } from './carts.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roler.decorator';
import { UserRole } from 'src/commom/utils/constants';
import { PageOptionsDto } from 'src/commom/dto/pageOptions.dto';
import { pick } from 'src/commom/utils/helper';

@UseGuards(JwtAuthGuard)
@Controller('v1/cart')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post()
  create(@Req() req, @Body() createCartDto: CreateCartDto) {
    const user = req['user'];
    return this.cartsService.addItemToCart(user.id, createCartDto);
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Get('user')
  findCartByUser(@Req() req, @Query() pageOptionsDto: PageOptionsDto) {
    const user = req['user'];
    const options = pick(pageOptionsDto, ['page', 'limit', 'sort', 'order']);
    return this.cartsService.findCartByUser(user.id, options);
  }
  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('/delete')
  removeItemFromCart(@Body() body: UpdateCartDto) {
    return this.cartsService.removeItemFromCart(body.cartId, body.quantity);
  }
  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Post('/update')
  updateItemQuantity(@Body() body: UpdateCartDto) {
    return this.cartsService.updateItemQuantity(
      body.cartId,
      body.productId,
      body.quantity,
    );
  }

  @Roles(UserRole.USER)
  @UseGuards(RolesGuard)
  @Get('user/count')
  findOne(@Req() req) {
    const user = req['user'];
    return this.cartsService.getCartItemCount(user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
  //   return this.cartsService.update(id, updateCartDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cartsService.remove(id);
  // }
}
