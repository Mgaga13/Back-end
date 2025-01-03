import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
import { OrdersModule } from 'src/orders/orders.module';
import { OrdersService } from 'src/orders/orders.service';
import { ProductsModule } from 'src/products/products.module';
@Module({
  imports: [OrdersModule, ProductsModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
