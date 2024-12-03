import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartItemDto } from './dto/update-cart_item.dto';
import { CartItemEntity } from './entities/cart_item.entity';

@Controller('v1/cart-items')
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  async createCartItem(
    @Body() createCartItemDto: CreateCartItemDto,
  ): Promise<CartItemEntity> {
    return this.cartItemsService.createCartItem(createCartItemDto);
  }

  @Get(':cartId')
  async getCartItems(
    @Param('cartId') cartId: string,
  ): Promise<CartItemEntity[]> {
    return this.cartItemsService.getCartItems(cartId);
  }

  @Patch(':cartItemId')
  async updateCartItemQuantity(
    @Param('cartItemId') cartItemId: string,
    @Body('quantity') quantity: number,
  ): Promise<CartItemEntity> {
    return this.cartItemsService.updateCartItemQuantity(cartItemId, quantity);
  }

  @Delete(':cartItemId')
  async deleteCartItem(@Param('cartItemId') cartItemId: string): Promise<void> {
    await this.cartItemsService.deleteCartItem(cartItemId);
  }
}
