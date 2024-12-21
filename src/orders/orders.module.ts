import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderDetailsModule } from 'src/order-details/order-details.module';
import { CartsModule } from 'src/carts/carts.module';
import { CartItemsModule } from 'src/cart_items/cart_items.module';
import { OrderDetailEntity } from 'src/order-details/entities/order-detail.entity';
import { CartEntity } from 'src/carts/entities/cart.entity';
import { CartItemEntity } from 'src/cart_items/entities/cart_item.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderEntity,
      OrderDetailEntity,
      CartEntity,
      CartItemEntity,
      ProductEntity,
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
