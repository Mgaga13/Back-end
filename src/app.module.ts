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
import { BannerDetailsModule } from './banner_details/banner_details.module';
import { ExceptionsLoggerFilter } from './commom/utils/exceptionLogger.filter';
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
    UsersModule,
    AuthModule,
    FeedbackModule,
    BrannersModule,
    BannerDetailsModule,
    ProductsModule,
    // ProductImagesModule,
    CategoriesModule,
    BrandsModule,
    CartsModule,
    CartItemsModule,
    OrdersModule,
    OrderDetailsModule,
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
