import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from 'src/app.controller';
import { AppService } from './app.service';
import * as Joi from 'joi';

import { APP_FILTER } from '@nestjs/core';
import * as dotenv from 'dotenv';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { BrandsModule } from './brands/brands.module';
import { CartsModule } from './carts/carts.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { OrdersModule } from './orders/orders.module';
import { OrderDetailsModule } from './order-details/order-details.module';
import { TypeOrmModule } from './datasource/typeorm.module';
import { AuthModule } from './auth/auth.module';
import { FeedbackModule } from './feedback/feedback.module';
import { BrannersModule } from './branners/branners.module';
import { ExceptionsLoggerFilter } from './commom/utils/exceptionLogger.filter';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentModule } from './payment/payment.module';
import { ReportModule } from './report/report.module';
import { VnpayModule } from 'nestjs-vnpay';
import { ignoreLogger } from 'vnpay';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60,
        limit: 10,
      },
    ]),
    VnpayModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secureSecret: configService.getOrThrow<string>('VNPAY_SECURE_SECRET'),
        tmnCode: configService.getOrThrow<string>('VNPAY_TMN_CODE'),
        loggerFn: ignoreLogger,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    FeedbackModule,
    BrannersModule,
    ProductsModule,
    // ProductImagesModule,
    CategoriesModule,
    BrandsModule,
    CartsModule,
    CartItemsModule,
    OrdersModule,
    OrderDetailsModule,
    CloudinaryModule,
    PaymentModule,
    ReportModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: ExceptionsLoggerFilter,
    },
  ],
})
export class AppModule {}
