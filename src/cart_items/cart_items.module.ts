import { Module } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { ProductEntity } from 'src/products/entities/product.entity';
import { CartEntity } from 'src/carts/entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemEntity } from './entities/cart_item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([CartItemEntity, ProductEntity, CartEntity]),
  ],
  controllers: [CartItemsController],
  providers: [CartItemsService],
  exports: [CartItemsService],
})
export class CartItemsModule {}
